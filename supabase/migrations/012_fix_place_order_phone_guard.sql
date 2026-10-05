-- =============================================================================
-- Migration: 007_fix_place_order_phone_guard.sql
-- Purpose:   Fix place_order()'s phone-required guard, which only checked
--            profiles.phone and ignored p_customer_phone — the phone
--            number the customer may have just typed directly into the
--            checkout form. A user with no saved profile phone would be
--            rejected with "Please add a phone number to your profile"
--            even after correctly filling in the phone field on the
--            checkout page itself.
--
-- Root cause: Guard 2 (added in 003_functions.sql) read:
--
--   select phone into v_profile_phone from public.profiles where id = v_user_id;
--   if v_profile_phone is null then raise exception 'Phone number required' ...
--
--   This never looked at p_customer_phone at all, even though the order
--   itself (Step 1's INSERT, since 005) already correctly falls back to
--   it: `coalesce(p_customer_phone, v_profile_phone)`. The guard and the
--   actual insert disagreed about which phone number "counts".
--
-- Fix:       The guard now passes if *either* p_customer_phone (from the
--            form) or the profile's saved phone is present — matching
--            the coalesce() already used when the order row is written.
--
-- Source of truth: db-schema.md § 2.5 — the requirement itself ("a phone
--                  number must exist before an order can be placed") is
--                  unchanged; only which source satisfies it is corrected.
-- Depends on: 001_create_tables.sql, 002_triggers.sql, 003_functions.sql,
--             005_fix_place_order_insert_order.sql
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
  -- Guard 2: a phone number must exist, from EITHER the checkout form
  --          (p_customer_phone) OR the saved profile (profiles.phone).
  --          FIX: previously only checked the profile, ignoring a phone
  --          number the user may have just typed into the form itself.
  -- -----------------------------------------------------------------------
  select phone into v_profile_phone
    from public.profiles
   where id = v_user_id;

  if p_customer_phone is null and v_profile_phone is null then
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
  -- Step 1: Create the order shell — inserts immediately (fixed in 005),
  --         with zeroed totals as a placeholder. customer_phone already
  --         correctly coalesces p_customer_phone with the profile's
  --         phone — that part of Step 1 did not need to change here.
  -- -----------------------------------------------------------------------
  v_order_id := gen_random_uuid();

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
    coalesce(p_customer_name, ''),                 -- fallback to empty string (NOT NULL column)
    coalesce(p_customer_phone, v_profile_phone),    -- fall back to profile phone
    'pending',
    0,                                               -- placeholder — corrected below
    0,                                               -- placeholder — corrected below
    0,                                               -- placeholder — corrected below
    p_shipping,
    p_payment_method
  );

  -- -----------------------------------------------------------------------
  -- Step 2: Insert order_items with server-verified pricing
  --         and accumulate the raw subtotal.
  -- -----------------------------------------------------------------------
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity   := coalesce((v_item ->> 'quantity')::integer, 1);
    v_bundle_id  := (v_item ->> 'bundle_id')::uuid;   -- NULL for standalone

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
      v_product_name,
      v_quantity,
      v_product_price,
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
  -- Step 4: UPDATE the orders row created in Step 1 with the real totals.
  -- -----------------------------------------------------------------------
  update public.orders
     set subtotal       = v_subtotal,
         discount_total  = v_discount_total,
         total_price     = v_total_price
   where id = v_order_id;

  return v_order_id;
end;
$$;

comment on function public.place_order(jsonb, jsonb, text, text, text) is
  'Atomically creates an order + line items with server-verified pricing. Requires a phone number from either the checkout form (p_customer_phone) or the caller''s profile (fixed in 007 — previously only checked the profile). Applies the 5 % bundle discount rule per bundle with 3+ items. See db-schema.md § 3.4.';

-- =============================================================================
-- End of 007_fix_place_order_phone_guard.sql
-- =============================================================================