"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteOwnReview,
  reviewsQueryKey,
  type DeleteOwnReviewInput,
} from "@/lib/queries/reviews";
import { createClient } from "@/lib/supabase/client";

export type { DeleteOwnReviewInput };

export function useDeleteOwnReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteOwnReviewInput) => {
      const supabase = createClient();

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("You must be logged in to delete a review.");
      }

      return deleteOwnReview(supabase, userData.user.id, input);
    },
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
