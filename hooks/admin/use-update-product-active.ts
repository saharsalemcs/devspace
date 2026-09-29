"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProductActive } from "@/lib/queries/admin-products";
import { createClient } from "@/lib/supabase/client";

interface UpdateProductActiveInput {
  productId: string;
  isActive: boolean;
}

export function useUpdateProductActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, isActive }: UpdateProductActiveInput) =>
      updateProductActive(createClient(), productId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}
