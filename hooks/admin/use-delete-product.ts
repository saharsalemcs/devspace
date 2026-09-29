"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteProduct } from "@/lib/queries/admin-products";
import { createClient } from "@/lib/supabase/client";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(createClient(), productId),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}
