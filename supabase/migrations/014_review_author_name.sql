-- =============================================================================
-- Migration: 010_review_author_name.sql
-- Purpose:   Make reviewer names visible to everyone, without opening up
--            public.profiles.
--
-- Problem:   fetchReviews() embedded profiles(full_name). profiles RLS only
--            lets a user read their own row (and admins read all), so for any
--            other viewer the embed came back null and the UI showed
--            "Anonymous" — even though the name exists in the database.
--
-- Fix:       Snapshot the author's display name on the review itself
--            (same idea as orders.customer_name — db-schema.md § 2.5).
--            profiles stays private (it holds phone); reviews is already
--            publicly readable, so the name rides along with it.
--
-- The trigger is SECURITY DEFINER (it must read profiles regardless of the
-- caller) and ALWAYS recomputes the value from profiles — whatever a client
-- sends for author_name is overwritten, so it can't be spoofed.
--
-- Depends on: 001_create_tables.sql, 002_triggers.sql, 004_rls_policies.sql
-- =============================================================================

alter table public.reviews
  add column if not exists author_name text;

comment on column public.reviews.author_name is
  'Public snapshot of the author''s profiles.full_name, set by the set_review_author_name trigger on insert/update. Exists because profiles is not readable by other users (phone lives there). Never trust a client-supplied value — the trigger overwrites it.';

-- -----------------------------------------------------------------------------
-- Trigger function
-- -----------------------------------------------------------------------------
create or replace function public.set_review_author_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select p.full_name
    into new.author_name
    from public.profiles p
   where p.id = new.user_id;

  return new;
end;
$$;

comment on function public.set_review_author_name() is
  'BEFORE INSERT/UPDATE on reviews: sets author_name from profiles.full_name for new.user_id, overwriting any client-supplied value.';

drop trigger if exists set_review_author_name on public.reviews;

create trigger set_review_author_name
  before insert or update on public.reviews
  for each row
  execute function public.set_review_author_name();

-- -----------------------------------------------------------------------------
-- Backfill existing reviews. set_updated_at is disabled for the duration so
-- the backfill doesn't change every review's updated_at.
-- -----------------------------------------------------------------------------
alter table public.reviews disable trigger set_updated_at;

update public.reviews r
   set author_name = p.full_name
  from public.profiles p
 where p.id = r.user_id;

alter table public.reviews enable trigger set_updated_at;

-- =============================================================================
-- End of 010_review_author_name.sql
-- =============================================================================