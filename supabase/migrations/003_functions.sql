-- =============================================================================
-- Migration: 003_functions.sql
-- Purpose:   Create the two RPC functions and one view described in
--            db-schema.md § 3.3 – § 3.5.
-- Source of truth: db-schema.md (v1.2) — every function/view here traces
--                  back to a decision documented there. Do not edit
--                  behaviour here without updating db-schema.md first.
--
-- Objects (creation order):
--   1. calculate_bundle_total  — RPC, db-schema.md § 3.3
--   2. place_order              — RPC, db-schema.md § 3.4
--   3. product_rating_stats     — View, db-schema.md § 3.5
--
-- Depends on: 001_create_tables.sql, 002_triggers.sql
-- =============================================================================

-- =============================================================================
-- 1. calculate_bundle_total — db-schema.md § 3.3
-- =============================================================================
-- Server-authoritative pricing for the Desk Builder. The client sends an
-- array of product UUIDs; the server returns subtotal, discount, total, and
-- the number of items found. Only active products are priced — inactive ones
-- are silently excluded (the client should treat item_count < input length
-- as a stale-catalog signal).
--
-- Discount rule (from project-spec.md Appendix A / db-schema.md § 2.2):
--   3 or more items  →  5 % off the subtotal
--   fewer than 3     →  no discount
-- =============================================================================
create or replace function public.calculate_bundle_total(product_ids uuid[])
returns table (
  subtotal   numeric,
  discount   numeric,
  total      numeric,
  item_count integer
)
language plpgsql
stable                       -- reads data but never writes
security invoker             -- runs with the caller's RLS context
as $$
declare
  v_subtotal   numeric;
  v_discount   numeric;
  v_item_count integer;
begin
  -- Sum prices of the requested products (active only).
  select coalesce(sum(p.price), 0),
         count(*)::integer
    into v_subtotal, v_item_count
    from public.products p
   where p.id = any(product_ids)
     and p.is_active = true;

  -- Apply the bundle discount rule.
  if v_item_count >= 3 then
    v_discount := round(v_subtotal * 0.05, 2);
  else
    v_discount := 0;
  end if;

  subtotal   := v_subtotal;
  discount   := v_discount;
  total      := v_subtotal - v_discount;
  item_count := v_item_count;

  return next;
end;
$$;

comment on function public.calculate_bundle_total(uuid[]) is
  'Server-authoritative Desk Builder pricing. Returns subtotal, discount (5 % when 3+ items), total, and item_count. Only active products are included. See db-schema.md § 3.3.';

-- =============================================================================
-- 2. place_order — db-schema.md § 3.4
-- =============================================================================
-- Atomically creates an order + its line items with server-verified pricing.
-- Never trusts client-side totals.
--
-- Parameters:
--   p_items           – jsonb array: [{product_id, quantity, bundle_id?}, …]
--   p_shipping        – jsonb object: {full_name, phone, street, city,
--                        governorate, postal_code, notes}
--   p_payment_method  – text (only 'cod' accepted in MVP)
--   p_customer_name   – text snapshot (prefilled from profiles.full_name,
--                        possibly edited in the checkout UI)
--   p_customer_phone  – text snapshot (prefilled from profiles.phone,
--                        possibly edited in the checkout UI)
--
-- Returns: the new order's UUID.
--
-- Server-side guards (db-schema.md § 2.5):
--   • auth.uid() must not be NULL (caller must be authenticated)
--   • profiles.phone must not be NULL (even if the client already sent a
--     phone — the profile record itself must have one)
-- =============================================================================
create or replace function public.place_order(
  p_items          jsonb,
  p_shipping       jsonb,
  p_payment_method text    default 'cod',
  p_customer_name  text    default null,
  p_customer_phone text    default null
)
returns uuid
language plpgsql
security definer           -- needs unrestricted access to products/orders/order_items
set search_path = public
as $$
declare
  v_user_id        uuid;
  v_profile_phone  text;
  v_order_id       uuid;
  v_subtotal       numeric := 0;
  v_discount_total numeric := 0;
  v_total_price    numeric := 0;

  -- Per-item working variables
  v_item           jsonb;
  v_product_id     uuid;
  v_product_name   text;
  v_product_price  numeric;
  v_quantity       integer;
  v_bundle_id      uuid;
  v_line_subtotal  numeric;

  -- Bundle discount calculation
  v_bundle         record;
  v_bundle_discount numeric;
begin
  -- -----------------------------------------------------------------------
  -- Guard 1: caller must be authenticated
  -- -----------------------------------------------------------------------
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated'
      using hint = 'You must be logged in to place an order.';
  end if;

  -- -----------------------------------------------------------------------
  -- Guard 2: profile must have a phone number (db-schema.md § 2.5)
  -- -----------------------------------------------------------------------
  select phone into v_profile_phone
    from public.profiles
   where id = v_user_id;

  if v_profile_phone is null then
    raise exception 'Phone number required'
      using hint = 'Please add a phone number to your profile before placing an order.';
  end if;

  -- -----------------------------------------------------------------------
  -- Guard 3: items array must not be empty
  -- -----------------------------------------------------------------------
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty'
      using hint = 'At least one item is required to place an order.';
  end if;

  -- -----------------------------------------------------------------------
  -- Step 1: Create the order shell (totals filled after line-item loop)
  -- -----------------------------------------------------------------------
  v_order_id := gen_random_uuid();

  -- -----------------------------------------------------------------------
  -- Step 2: Insert order_items with server-verified pricing
  --         and accumulate the raw subtotal.
  -- -----------------------------------------------------------------------
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity   := coalesce((v_item ->> 'quantity')::integer, 1);
    v_bundle_id  := (v_item ->> 'bundle_id')::uuid;   -- NULL for standalone

    -- Fetch the current (live) price + name from the catalog.
    select name, price
      into v_product_name, v_product_price
      from public.products
     where id = v_product_id
       and is_active = true;

    if v_product_name is null then
      raise exception 'Product not found or inactive: %', v_product_id
        using hint = 'One of the products in your cart is no longer available.';
    end if;

    v_line_subtotal := v_product_price * v_quantity;
    v_subtotal      := v_subtotal + v_line_subtotal;

    insert into public.order_items (
      id, order_id, product_id, product_name, quantity, unit_price, bundle_id
    ) values (
      gen_random_uuid(),
      v_order_id,
      v_product_id,
      v_product_name,          -- snapshot
      v_quantity,
      v_product_price,         -- snapshot
      v_bundle_id
    );
  end loop;

  -- -----------------------------------------------------------------------
  -- Step 3: Calculate per-bundle discounts (db-schema.md § 2.2)
  --         5 % off any bundle with 3 or more distinct items.
  -- -----------------------------------------------------------------------
  for v_bundle in
    select oi.bundle_id,
           sum(oi.unit_price * oi.quantity) as bundle_subtotal,
           count(*)                         as bundle_item_count
      from public.order_items oi
     where oi.order_id  = v_order_id
       and oi.bundle_id is not null
     group by oi.bundle_id
    having count(*) >= 3
  loop
    v_bundle_discount := round(v_bundle.bundle_subtotal * 0.05, 2);
    v_discount_total  := v_discount_total + v_bundle_discount;
  end loop;

  v_total_price := v_subtotal - v_discount_total;

  -- -----------------------------------------------------------------------
  -- Step 4: Insert the orders row with snapshotted totals + customer info
  -- -----------------------------------------------------------------------
  insert into public.orders (
    id,
    user_id,
    customer_name,
    customer_phone,
    status,
    subtotal,
    discount_total,
    total_price,
    shipping_address,
    payment_method
  ) values (
    v_order_id,
    v_user_id,
    coalesce(p_customer_name, ''),     -- fallback to empty string (NOT NULL column)
    coalesce(p_customer_phone, v_profile_phone),  -- fall back to profile phone
    'pending',
    v_subtotal,
    v_discount_total,
    v_total_price,
    p_shipping,
    p_payment_method
  );

  return v_order_id;
end;
$$;

comment on function public.place_order(jsonb, jsonb, text, text, text) is
  'Atomically creates an order + line items with server-verified pricing. Rejects calls when the caller has no phone on their profile. Applies the 5 % bundle discount rule per bundle with 3+ items. See db-schema.md § 3.4.';

-- =============================================================================
-- 3. product_rating_stats — db-schema.md § 3.5
-- =============================================================================
-- Simple view (not materialized — fine for MVP traffic). Joined into product
-- list/detail queries to show average rating and review count without an
-- N+1 problem.
-- =============================================================================
create or replace view public.product_rating_stats as
select
  r.product_id,
  count(*)::integer           as review_count,
  round(avg(r.rating), 1)    as average_rating
from public.reviews r
group by r.product_id;

comment on view public.product_rating_stats is
  'Pre-aggregated review stats per product (count + average). Simple view — recomputed on each query; swap to materialized if performance becomes an issue. See db-schema.md § 3.5.';

-- =============================================================================
-- End of 003_functions.sql
-- =============================================================================