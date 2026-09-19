-- =============================================================================
-- Migration: 002_triggers.sql
-- Purpose:   Create the two triggers described in db-schema.md § 3.
-- Source of truth: db-schema.md (v1.2) — every trigger here traces back
--                  to a decision documented there. Do not edit trigger
--                  behavior here without updating db-schema.md first.
--
-- Triggers:
--   1. on_auth_user_created  — AFTER INSERT on auth.users
--                               → inserts the matching public.profiles row
--   2. set_updated_at         — BEFORE UPDATE on profiles, products,
--                               orders, reviews → bumps updated_at
--
-- Depends on: 001_create_tables.sql (all tables must already exist)
-- =============================================================================

-- =============================================================================
-- 1. on_auth_user_created — db-schema.md § 3.1
-- =============================================================================
-- Fires after a new row lands in auth.users and creates the corresponding
-- public.profiles row. SECURITY DEFINER is required because the invoking
-- role (the Auth service, on behalf of the new user) would not otherwise
-- have insert privileges on public.profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    'customer'
  );

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates a public.profiles row for every new auth.users signup. full_name is read from raw_user_meta_data (set by the signUp server action). role always defaults to customer — admin is only ever set manually via SQL. See db-schema.md § 3.1.';

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =============================================================================
-- 2. set_updated_at — db-schema.md § 3.2
-- =============================================================================
-- Generic, reusable trigger function: sets NEW.updated_at = now() on every
-- update. Attached to profiles, products, orders, and reviews (reviews
-- needed as of v1.2, since a customer can now edit their own review).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Generic BEFORE UPDATE trigger function: stamps NEW.updated_at with the current time. Applied to profiles, products, orders, and reviews. See db-schema.md § 3.2.';

-- profiles
drop trigger if exists set_updated_at on public.profiles;

create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- products
drop trigger if exists set_updated_at on public.products;

create trigger set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- orders
drop trigger if exists set_updated_at on public.orders;

create trigger set_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

-- reviews (added in v1.2 — enables "edit your own review")
drop trigger if exists set_updated_at on public.reviews;

create trigger set_updated_at
  before update on public.reviews
  for each row
  execute function public.set_updated_at();

-- =============================================================================
-- End of 002_triggers.sql
-- =============================================================================