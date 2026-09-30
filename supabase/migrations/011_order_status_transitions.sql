-- =============================================================================
-- Migration: 011_order_status_transitions.sql
-- Purpose:   Enforce the order status lifecycle (db-schema.md § 2.3) in the
--            database, not only in the admin UI.
--
--            Why: the RLS policy "Admins can update orders" (004) lets an admin
--            set ANY status. The UI only offers valid next steps, but a stale
--            tab, a second admin, or a direct API call could still move
--            delivered -> pending or resurrect a cancelled order.
--
-- Allowed transitions (keep in sync with lib/order-status.ts):
--   pending    -> processing | cancelled
--   processing -> shipped
--   shipped    -> delivered
--   delivered, cancelled: terminal
--
-- NOTE: this applies to EVERY role, including manual edits in the Supabase
-- dashboard. To fix a wrongly-set status by hand, disable the trigger first.
-- Depends on: 001_create_tables.sql, 002_triggers.sql
-- =============================================================================

create or replace function public.enforce_order_status_transition()
returns trigger
language plpgsql
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if not (
       (old.status = 'pending'    and new.status in ('processing', 'cancelled'))
    or (old.status = 'processing' and new.status = 'shipped')
    or (old.status = 'shipped'    and new.status = 'delivered')
  ) then
    raise exception 'Invalid order status transition: % -> %', old.status, new.status
      using hint = 'Refresh the page: the order may have been updated by someone else.';
  end if;

  return new;
end;
$$;

comment on function public.enforce_order_status_transition() is
  'Rejects order status changes that break the lifecycle pending -> processing -> shipped -> delivered (pending -> cancelled also allowed). See db-schema.md § 2.3.';

drop trigger if exists enforce_order_status_transition on public.orders;

create trigger enforce_order_status_transition
  before update of status on public.orders
  for each row
  execute function public.enforce_order_status_transition();

-- =============================================================================
-- End of 011_order_status_transitions.sql
-- =============================================================================