"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateReview,
  reviewsQueryKey,
  type UpdateReviewInput,
} from "@/lib/queries/reviews";
import { createClient } from "@/lib/supabase/client";

export type { UpdateReviewInput };

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateReviewInput) => {
      const supabase = createClient();

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("You must be logged in to edit a review.");
      }

      return updateReview(supabase, userData.user.id, input);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: reviewsQueryKey(variables.productId),
      });
    },
  });
}
