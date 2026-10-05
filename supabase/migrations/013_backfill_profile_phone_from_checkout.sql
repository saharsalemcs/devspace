-- =============================================================================
-- Migration: 008_backfill_profile_phone_from_checkout.sql
-- Purpose:   When a customer types a phone number into the checkout form
--            and their profile has none saved, persist it to
--            profiles.phone so they aren't asked for it again on their
--            next order.
--
-- Decision:  Only BACKFILLS when profiles.phone is currently NULL — never
--            overwrites an existing saved phone. The checkout form's
--            phone is a per-order contact number (could be a delivery
--            recipient other than the account owner); it should not
--            silently clobber the account's own saved phone just because
--            it differs on one particular order.
--
-- Depends on: 007_fix_place_order_phone_guard.sql
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
security definer
set search_path = public
as $$
declare
  v_user_id        uuid;
  v_profile_phone  text;
  v_order_id       uuid;
  v_subtotal       numeric := 0;
  v_discount_total numeric := 0;
  v_total_price    numeric := 0;

  v_item           jsonb;
  v_product_id     uuid;
  v_product_name   text;
  v_product_price  numeric;
  v_quantity       integer;
  v_bundle_id      uuid;
  v_line_subtotal  numeric;

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
  -- -----------------------------------------------------------------------
  select phone into v_profile_phone
    from public.profiles
   where id = v_user_id;

  if p_customer_phone is null and v_profile_phone is null then
    raise exception 'Phone number required'
      using hint = 'Please add a phone number to your profile before placing an order.';
  end if;

  -- -----------------------------------------------------------------------
  -- NEW: Backfill profiles.phone from the checkout form, but only when
  --      the profile currently has none. Never overwrites an existing
  --      saved phone (see migration header). set_updated_at fires
  --      automatically via its existing trigger — no action needed here.
  -- -----------------------------------------------------------------------
  if v_profile_phone is null and p_customer_phone is not null then
    update public.profiles
       set phone = p_customer_phone
     where id = v_user_id;
  end if;

  -- -----------------------------------------------------------------------
  -- Guard 3: items array must not be empty
  -- -----------------------------------------------------------------------
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty'
      using hint = 'At least one item is required to place an order.';
  end if;

  -- -----------------------------------------------------------------------
  -- Step 1: Create the order shell (placeholder totals, corrected below).
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
    coalesce(p_customer_name, ''),
    coalesce(p_customer_phone, v_profile_phone),
    'pending',
    0,
    0,
    0,
    p_shipping,
    p_payment_method
  );

  -- -----------------------------------------------------------------------
  -- Step 2: Insert order_items with server-verified pricing.
  -- -----------------------------------------------------------------------
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity   := coalesce((v_item ->> 'quantity')::integer, 1);
    v_bundle_id  := (v_item ->> 'bundle_id')::uuid;

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
  -- Step 3: Calculate per-bundle discounts.
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
  -- Step 4: UPDATE the orders row with the real totals.
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
  'Atomically creates an order + line items with server-verified pricing. Requires a phone number from either the checkout form (p_customer_phone) or the caller''s profile. Backfills profiles.phone from the checkout form when the profile has none (never overwrites an existing one). Applies the 5 % bundle discount rule per bundle with 3+ items. See db-schema.md § 3.4.';

-- =============================================================================
-- End of 008_backfill_profile_phone_from_checkout.sql
-- =============================================================================