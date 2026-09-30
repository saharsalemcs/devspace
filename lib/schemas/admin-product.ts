import { z } from "zod";

// db-schema.md § 2.1: gallery limit. Shared with GalleryUploadField so the UI
// and the validation can't drift apart.
export const MAX_GALLERY_IMAGES = 8;

// db-schema.md § 2.1: every image URL must point to our Supabase Storage bucket.
// (next.config.ts only whitelists this host for next/image anyway.)
const STORAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/`;

const storageUrl = (message: string) =>
  z.string().startsWith(STORAGE_PREFIX, message);

export const adminProductSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name"),
  category_id: z.uuid("Select a category"),
  // products.price is numeric(10, 2): anything above this overflows in Postgres.
  price: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .max(99999999.99, "Price is too large"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be under 2000 characters")
    .optional()
    .or(z.literal("")),
  image_url: storageUrl("Upload a primary image"),
  images: z
    .array(storageUrl("Invalid gallery image"))
    .max(MAX_GALLERY_IMAGES, `Up to ${MAX_GALLERY_IMAGES} gallery images`)
    .default([]),
  is_active: z.boolean().default(true),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;
