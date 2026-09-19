-- =============================================================================
-- Migration: 005_storage.sql
-- Purpose:   Create the product-images Storage bucket and its access policies.
-- Source of truth: task-breakdown.md § 2.8 / project-spec.md § 2.2 (#7)
--
-- Bucket:
--   product-images  — public read, admin-only upload
--
-- Policies:
--   1. SELECT (download) — anyone (public bucket)
--   2. INSERT (upload)   — authenticated admins only
--   3. UPDATE (replace)  — authenticated admins only
--   4. DELETE (remove)   — authenticated admins only
--
-- Depends on: 004_rls_policies.sql (is_admin() helper must exist)
-- =============================================================================

-- =============================================================================
-- 1. Create the bucket
-- =============================================================================
-- public = true  → files are served without an auth token on the download URL,
--                   which is what we need for <img src="…"> on the storefront.
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- =============================================================================
-- 2. Download policy — anyone can read (public storefront)
-- =============================================================================
create policy "Anyone can view product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

-- =============================================================================
-- 3. Upload policy — admins only
-- =============================================================================
create policy "Admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

-- =============================================================================
-- 4. Replace / overwrite policy — admins only
-- =============================================================================
create policy "Admins can update product images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  )
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

-- =============================================================================
-- 5. Delete policy — admins only
-- =============================================================================
create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  );

-- =============================================================================
-- End of 005_storage.sql
-- =============================================================================