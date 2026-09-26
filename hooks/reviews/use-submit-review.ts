"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  submitReview,
  reviewsQueryKey,
  type SubmitReviewInput,
} from "@/lib/queries/reviews";
import { createClient } from "@/lib/supabase/client";

export { DuplicateReviewError } from "@/lib/queries/reviews";
export type { SubmitReviewInput };

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitReviewInput) => {
      const supabase = createClient();

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("You must be logged in to submit a review.");
      }

      return submitReview(supabase, userData.user.id, input);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: reviewsQueryKey(variables.productId),
      });
    },
  });
}
