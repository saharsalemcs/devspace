-- =============================================================================
-- Migration: 010_product_images_bucket_limits.sql
-- Purpose:   Enforce image type + size limits on the product-images bucket
--            itself (server-side). The client-side checks in
--            lib/storage/product-images.ts are only UX; anyone with an admin
--            session could call the Storage API directly and skip them.
--
-- Depends on: 005_storage-product-images.sql (bucket must already exist)
-- =============================================================================

update storage.buckets
   set file_size_limit    = 5242880,   -- 5 MB, matches MAX_IMAGE_SIZE_MB
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
 where id = 'product-images';

-- =============================================================================
-- End of 010_product_images_bucket_limits.sql
-- =============================================================================