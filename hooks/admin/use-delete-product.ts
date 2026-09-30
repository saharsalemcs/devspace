"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteProduct } from "@/lib/queries/admin-products";
import { invalidateProductQueries } from "@/lib/queries/invalidate-product-queries";
import { createClient } from "@/lib/supabase/client";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(createClient(), productId),
    onSuccess: (_data, productId) =>
      invalidateProductQueries(queryClient, productId),
  });
}
