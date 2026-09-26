import {
  reviewsQueryKey,
  submitReview,
  SubmitReviewInput,
} from "@/lib/queries/reviews";
import { createClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
