"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteReviewAsAdmin } from "@/lib/queries/admin-reviews";
import { invalidateReviewQueries } from "@/lib/queries/invalidate-product-queries";
import { createClient } from "@/lib/supabase/client";

export function useDeleteAdminReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) =>
      deleteReviewAsAdmin(createClient(), reviewId),
    onSettled: () => invalidateReviewQueries(queryClient),
  });
}
