"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteReview,
  reviewsQueryKey,
  type DeleteReviewInput,
} from "@/lib/queries/reviews";
import { createClient } from "@/lib/supabase/client";

export type { DeleteReviewInput };

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteReviewInput) =>
      deleteReview(createClient(), input),
    onSuccess: (_data, variables) => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: reviewsQueryKey(variables.productId),
        }),
        queryClient.invalidateQueries({ queryKey: ["product"] }),
      ]);
    },
  });
}
