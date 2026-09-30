"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProductActive } from "@/lib/queries/admin-products";
import { invalidateProductQueries } from "@/lib/queries/invalidate-product-queries";
import { createClient } from "@/lib/supabase/client";

interface UpdateProductActiveVariables {
  productId: string;
  isActive: boolean;
}

export function useUpdateProductActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, isActive }: UpdateProductActiveVariables) =>
      updateProductActive(createClient(), productId, isActive),
    onSuccess: (_data, { productId }) =>
      invalidateProductQueries(queryClient, productId),
  });
}
