-- =============================================================================
-- Migration: 005_fix_place_order_insert_order.sql
-- Purpose:   Fix a bug in place_order() (003_functions.sql) where the
--            orders row was never actually inserted before order_items
--            rows referencing it were inserted, causing every call to
--            fail with a foreign key violation:
--              insert or update on table "order_items" violates foreign
--              key constraint "order_items_order_id_fkey"
--
--            Root cause: "Step 1" only generated v_order_id with
--            gen_random_uuid() — the comment said "Create the order
--            shell" but the actual INSERT was missing. The real INSERT
--            into orders happened in "Step 4", four steps *after*
--            order_items were already inserted referencing it.
--
-- Fix:       Insert the orders row immediately after generating
--            v_order_id, with zeroed totals as a placeholder ("the
--            shell" the original comment described). After the
--            line-item loop and bundle-discount calculation determine
--            the real totals, UPDATE that same row instead of
--            inserting a second one.
--
-- Source of truth: db-schema.md § 3.4 — behavior/guards are unchanged,
--                  only the insert/update ordering is corrected.
-- Depends on: 001_create_tables.sql, 002_triggers.sql, 003_functions.sql
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
  -- Step 1: Create the order shell — FIX: this now actually inserts the
  --         row (with placeholder zero totals), instead of only
  --         generating v_order_id. order_items.order_id has a foreign
  --         key into orders.id, so the parent row must exist before any
  --         order_items insert below can succeed.
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
  -- Step 4: FIX — UPDATE the orders row created in Step 1 with the real
  --         totals, instead of a second INSERT (which would have hit a
  --         duplicate primary key on v_order_id even if the FK ordering
  --         bug hadn't already broken the call first).
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
  'Atomically creates an order + line items with server-verified pricing. Rejects calls when the caller has no phone on their profile. Applies the 5 % bundle discount rule per bundle with 3+ items. Inserts the orders row before order_items (fixed in 005 — order_items.order_id is a foreign key into orders.id and cannot reference a row that does not exist yet), then updates it with final totals once they are known. See db-schema.md § 3.4.';

-- =============================================================================
-- End of 005_fix_place_order_insert_order.sql
-- =============================================================================