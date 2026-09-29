-- =============================================================================
-- Migration: 006_admin_dashboard_stats.sql
-- Purpose:   Single RPC returning the 5 admin dashboard KPIs (task-breakdown
--            § 9.2) in one round trip, instead of 5 separate queries.
--
-- Security:  Deliberately SECURITY INVOKER (the default — no clause needed),
--            not SECURITY DEFINER. It runs with the *caller's* RLS context,
--            so the existing admin-scoped RLS policies on profiles/orders/
--            products ("Admins can view all X") are the real guard here —
--            same "let RLS decide" approach as useDeleteReview (Phase 7).
--            If a non-admin somehow calls this, RLS silently restricts each
--            subquery to what that caller could already see (their own
--            profile/orders row, active products only) — meaningless
--            numbers for them, not a data leak. No separate is_admin()
--            check needed inside the function.
-- =============================================================================

create or replace function public.admin_dashboard_stats()
returns table (
  total_orders          integer,
  orders_this_month     integer,
  total_revenue         numeric,
  customer_count        integer,
  active_product_count  integer
)
language sql
stable
as $$
  select
    (select count(*) from public.orders)::integer,
    (select count(*)
       from public.orders
      where created_at >= date_trunc('month', now()))::integer,
    -- Revenue = delivered orders only (project decision — pending/cod
    -- orders haven't actually been paid/collected yet).
    (select coalesce(sum(total_price), 0)
       from public.orders
      where status = 'delivered'),
    (select count(*) from public.profiles where role = 'customer')::integer,
    (select count(*) from public.products where is_active = true)::integer;
$$;

comment on function public.admin_dashboard_stats() is
  'Admin dashboard KPIs in one round trip: total orders, orders this month, revenue (delivered orders only), customer count (role=customer), active product count. SECURITY INVOKER — relies on existing admin RLS policies, not an internal role check. See task-breakdown.md § 9.2.';

-- =============================================================================
-- End of 006_admin_dashboard_stats.sql
-- =============================================================================