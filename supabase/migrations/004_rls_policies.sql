-- =============================================================================
-- Migration: 004_rls_policies.sql
-- Purpose:   Enable Row-Level Security on every public table and create the
--            policies that enforce the permission matrix from project-spec.md
--            § 3 and task-breakdown.md § 2.7.
-- Source of truth: db-schema.md (v1.2) + project-spec.md § 3 — do not edit
--                  access rules here without updating those documents first.
--
-- Tables (alphabetical):
--   1. profiles
--   2. categories
--   3. products
--   4. reviews
--   5. orders
--   6. order_items
--   7. cart_items
--
-- Helper:
--   is_admin()  — returns true when the caller's profiles.role = 'admin'
--
-- Depends on: 001_create_tables.sql, 002_triggers.sql, 003_functions.sql
-- =============================================================================

-- =============================================================================
-- Helper: is_admin()
-- =============================================================================
-- Avoids repeating the same subquery in every admin-gated policy.
-- SECURITY DEFINER so it can read public.profiles regardless of the calling
-- context (the profiles RLS policies reference auth.uid() directly and do
-- not call this function, so there is no circular dependency).
-- =============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.profiles
     where id   = auth.uid()
       and role = 'admin'
  );
$$;

comment on function public.is_admin() is
  'Returns true when the authenticated caller has role = admin in public.profiles. Used by RLS policies to gate admin-only operations.';

-- =============================================================================
-- Enable RLS on every table
-- =============================================================================
alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.reviews     enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items  enable row level security;

-- =============================================================================
-- 1. profiles — task-breakdown § 2.7
--    • Authenticated users SELECT / UPDATE their own row
--    • UPDATE must NOT be able to change the `role` column
--    • Admins can SELECT all rows (for the admin dashboard KPI +
--      order detail views)
-- =============================================================================
-- SELECT own row
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Admin SELECT all (for dashboard: customer count, order→customer lookups)
create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using (is_admin());

-- UPDATE own row — WITH CHECK ensures role cannot be changed through
-- the public API. The stored role must match whatever was already there.
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using  (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- Note: INSERT is handled by handle_new_user() (SECURITY DEFINER,
-- bypasses RLS). No public INSERT policy needed.
-- DELETE is intentionally absent — accounts are banned, never deleted
-- (db-schema.md § 2.6).

-- =============================================================================
-- 2. categories — task-breakdown § 2.7
--    • Public SELECT (guests + authenticated)
--    • Admin INSERT / UPDATE / DELETE
-- =============================================================================
create policy "Anyone can view categories"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Admins can insert categories"
  on public.categories for insert
  to authenticated
  with check (is_admin());

create policy "Admins can update categories"
  on public.categories for update
  to authenticated
  using  (is_admin())
  with check (is_admin());

create policy "Admins can delete categories"
  on public.categories for delete
  to authenticated
  using (is_admin());

-- =============================================================================
-- 3. products — task-breakdown § 2.7
--    • Public SELECT only where is_active = true
--    • Admin: full access (sees inactive products too)
-- =============================================================================
-- Public storefront: only active products
create policy "Anyone can view active products"
  on public.products for select
  to anon, authenticated
  using (is_active = true);

-- Admin: see everything (including inactive) + full write access
create policy "Admins can view all products"
  on public.products for select
  to authenticated
  using (is_admin());

create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (is_admin());

create policy "Admins can update products"
  on public.products for update
  to authenticated
  using  (is_admin())
  with check (is_admin());

create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (is_admin());

-- =============================================================================
-- 4. reviews — task-breakdown § 2.7
--    • Public SELECT (guests + authenticated)
--    • Authenticated INSERT own (user_id must equal auth.uid())
--    • Authenticated UPDATE / DELETE own row only
--    • Admin DELETE any row (moderation — no admin UPDATE of others')
-- =============================================================================
create policy "Anyone can view reviews"
  on public.reviews for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert own review"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own review"
  on public.reviews for update
  to authenticated
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Author can delete their own review
create policy "Users can delete own review"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = user_id);

-- Admin can delete any review (moderation)
create policy "Admins can delete any review"
  on public.reviews for delete
  to authenticated
  using (is_admin());

-- =============================================================================
-- 5. orders — task-breakdown § 2.7
--    • Users SELECT own orders (user_id = auth.uid())
--    • INSERT only via place_order RPC (SECURITY DEFINER, bypasses RLS)
--    • Admin SELECT all + UPDATE all (for status transitions)
-- =============================================================================
create policy "Users can view own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select
  to authenticated
  using (is_admin());

create policy "Admins can update orders"
  on public.orders for update
  to authenticated
  using  (is_admin())
  with check (is_admin());

-- No public INSERT policy — place_order() is SECURITY DEFINER and
-- bypasses RLS entirely. This prevents any direct INSERT through the
-- client, forcing all order creation through the RPC's server-side
-- validation (price verification, phone check, etc.).
-- No DELETE policy — orders are never deleted (historical integrity).

-- =============================================================================
-- 6. order_items — task-breakdown § 2.7
--    • SELECT if the parent order is visible to the caller
--    • INSERT only via place_order RPC (SECURITY DEFINER)
-- =============================================================================
create policy "Users can view own order items"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1
        from public.orders o
       where o.id      = order_id
         and o.user_id = auth.uid()
    )
  );

create policy "Admins can view all order items"
  on public.order_items for select
  to authenticated
  using (is_admin());

-- No INSERT / UPDATE / DELETE policies — all writes go through
-- place_order() (SECURITY DEFINER). Order line items are immutable
-- once created.

-- =============================================================================
-- 7. cart_items — task-breakdown § 2.7
--    • Authenticated users: full access to own rows only
-- =============================================================================
create policy "Users can view own cart items"
  on public.cart_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own cart items"
  on public.cart_items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own cart items"
  on public.cart_items for update
  to authenticated
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cart items"
  on public.cart_items for delete
  to authenticated
  using (auth.uid() = user_id);

-- =============================================================================
-- End of 004_rls_policies.sql
-- =============================================================================