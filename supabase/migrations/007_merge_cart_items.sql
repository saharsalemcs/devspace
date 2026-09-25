-- =============================================================================
-- Migration: 007_merge_cart_items.sql
-- Purpose:   RPC for the login-time cart merge described in db-schema.md § 4
--            ("Merge rule at login") and task-breakdown.md § 5.3.
--
-- Why an RPC instead of a plain client-side upsert: `cart_items` has no
-- single UNIQUE (user_id, product_id, bundle_id) constraint — it has two
-- *partial* unique indexes instead (see 001_create_tables.sql), because
-- Postgres treats every NULL bundle_id as distinct from every other NULL in
-- a plain unique constraint. A plain `ON CONFLICT (user_id, product_id,
-- bundle_id)` target (which is all the Supabase JS client's `.upsert()` can
-- express) does not match either partial index, so it would fail at
-- runtime. This function picks the correct conflict target per row
-- depending on whether bundle_id is NULL, matching the merge rule: sum
-- quantities on conflict.
--
-- Depends on: 001_create_tables.sql, 004_rls_policies.sql
-- =============================================================================
create or replace function public.merge_cart_items(p_items jsonb)
returns void
language plpgsql
security invoker             -- runs with the caller's RLS context (see cart_items policies)
as $$
declare
  v_item       jsonb;
  v_product_id uuid;
  v_bundle_id  uuid;
  v_quantity   integer;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    return;
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_bundle_id  := (v_item ->> 'bundle_id')::uuid;   -- NULL for standalone lines
    v_quantity   := coalesce((v_item ->> 'quantity')::integer, 1);

    if v_product_id is null or v_quantity <= 0 then
      continue;
    end if;

    if v_bundle_id is null then
      insert into public.cart_items (user_id, product_id, quantity, bundle_id)
      values (auth.uid(), v_product_id, v_quantity, null)
      on conflict (user_id, product_id) where bundle_id is null
      do update set quantity = public.cart_items.quantity + excluded.quantity;
    else
      insert into public.cart_items (user_id, product_id, quantity, bundle_id)
      values (auth.uid(), v_product_id, v_quantity, v_bundle_id)
      on conflict (user_id, product_id, bundle_id) where bundle_id is not null
      do update set quantity = public.cart_items.quantity + excluded.quantity;
    end if;
  end loop;
end;
$$;

comment on function public.merge_cart_items(jsonb) is
  'Login-time cart merge: upserts a guest''s localStorage cart lines ({product_id, bundle_id, quantity}[]) into cart_items for auth.uid(), summing quantity on conflict. See db-schema.md § 4.';

-- =============================================================================
-- End of 007_merge_cart_items.sql
-- =============================================================================
