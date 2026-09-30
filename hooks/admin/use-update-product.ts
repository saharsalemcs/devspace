"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProduct } from "@/lib/queries/admin-products";
import { invalidateProductQueries } from "@/lib/queries/invalidate-product-queries";
import { createClient } from "@/lib/supabase/client";
import { deleteProductImage } from "@/lib/storage/product-images";
import type { AdminProductInput } from "@/lib/schemas/admin-product";

interface ImageSet {
  image_url: string;
  images: string[];
}

interface UpdateProductVariables {
  id: string;
  values: AdminProductInput;
  // The images the product had when the edit form was opened.
  // Needed to know which files became unused after this save.
  previousImages: ImageSet;
}

// URLs that were on the product before, and are not on it anymore.
export function getRemovedImageUrls(
  previous: ImageSet,
  next: ImageSet,
): string[] {
  const kept = new Set([next.image_url, ...next.images]);
  return [previous.image_url, ...previous.images].filter(
    (url) => url && !kept.has(url),
  );
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
      previousImages,
    }: UpdateProductVariables) => {
      const supabase = createClient();
      const updated = await updateProduct(supabase, id, values);

      // Only reached if the DB update succeeded. If it had failed, the product
      // still points at the old images, so deleting them would break it.
      // Fire-and-forget: a failed cleanup just leaves an orphan file and must
      // not turn a successful save into an error (allSettled never rejects).
      const removed = getRemovedImageUrls(previousImages, values);
      void Promise.allSettled(
        removed.map((url) => deleteProductImage(supabase, url)),
      );

      return updated;
    },
    onSuccess: (updated) => invalidateProductQueries(queryClient, updated.id),
  });
}
