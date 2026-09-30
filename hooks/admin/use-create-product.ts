"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createProduct } from "@/lib/queries/admin-products";
import { invalidateProductQueries } from "@/lib/queries/invalidate-product-queries";
import { createClient } from "@/lib/supabase/client";
import type { AdminProductInput } from "@/lib/schemas/admin-product";

// Toasts and redirects are the caller's job (mutate(values, { onSuccess, onError })),
// same split as the reviews mutations: the hook owns data + cache, the form owns UX.
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: AdminProductInput) =>
      createProduct(createClient(), values),
    onSuccess: (created) => invalidateProductQueries(queryClient, created.id),
  });
}
