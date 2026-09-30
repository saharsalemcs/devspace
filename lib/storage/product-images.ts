import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const BUCKET = "product-images";

// Extension comes from the MIME type, never from the file name.
// SVG is intentionally excluded: next/image won't render it without
// dangerouslyAllowSVG, so it would show up as a broken image.
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const IMAGE_ACCEPT = Object.keys(ALLOWED_TYPES).join(",");
export const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

// Lets the UI tell "bad file, show this message" apart from "network/storage failure".
export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageValidationError";
  }
}

function validateImageFile(file: File): string {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new ImageValidationError("Only JPG, PNG or WebP images are allowed.");
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new ImageValidationError(
      `Each image must be under ${MAX_IMAGE_SIZE_MB} MB.`,
    );
  }
  return ext;
}

export async function uploadProductImage(
  supabase: SupabaseClient<Database>,
  file: File,
): Promise<string> {
  const ext = validateImageFile(file);
  const path = `products/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}

// Best-effort cleanup: errors are ignored on purpose. A failed delete leaves an
// orphan file, which is harmless, and must not block saving the product.
export async function deleteProductImage(
  supabase: SupabaseClient<Database>,
  imageUrl: string,
): Promise<void> {
  const marker = `/${BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;

  const path = imageUrl.slice(index + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
