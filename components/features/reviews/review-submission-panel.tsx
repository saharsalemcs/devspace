"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { useCurrentUser } from "@/hooks/use-current-user";
import { DuplicateReviewError } from "@/lib/queries/reviews";
import { ReviewForm } from "./review-form";
import { OwnReviewPanel } from "./own-review-panel";
import type {
  OptimisticReview,
  ReviewsOptimisticAction,
} from "./reviews-section";
import { useSubmitReview } from "@/hooks/reviews/use-submit-review";

interface ReviewSubmissionPanelProps {
  productId: string;
  ownReview: OptimisticReview | undefined;
  dispatchOptimistic: (action: ReviewsOptimisticAction) => void;
}

function ReviewSubmissionPanel({
  productId,
  ownReview,
  dispatchOptimistic,
}: ReviewSubmissionPanelProps) {
  const { data: currentUser, isPending: isUserPending } = useCurrentUser();
  const submitReview = useSubmitReview();
  const [isTransitionPending, startTransition] = useTransition();

  if (isUserPending) return null;

  if (!currentUser) {
    return (
      <p className="text-body-sm text-neutral-400">
        <Link href="/login" className="text-accent hover:underline">
          Log in
        </Link>{" "}
        to write a review.
      </p>
    );
  }

  if (ownReview) {
    return (
      <OwnReviewPanel
        productId={productId}
        review={ownReview}
        dispatchOptimistic={dispatchOptimistic}
      />
    );
  }

  const userId = currentUser.id;
  const userFullName = currentUser.fullName;

  function handleSubmit(data: { rating: number; comment: string | null }) {
    const placeholder: OptimisticReview = {
      id: `pending-${crypto.randomUUID()}`,
      product_id: productId,
      user_id: userId,
      rating: data.rating,
      comment: data.comment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: { full_name: userFullName },
      pending: true,
    };

    startTransition(async () => {
      dispatchOptimistic({ type: "add", review: placeholder });
      try {
        await submitReview.mutateAsync({ productId, ...data });
      } catch (error) {
        if (error instanceof DuplicateReviewError) {
          toast.error("You've already reviewed this product.");
        } else {
          toast.error("Couldn't submit your review. Please try again.");
        }
      }
    });
  }

  return (
    <ReviewForm
      submitLabel="Submit Review"
      isPending={isTransitionPending}
      onSubmit={handleSubmit}
    />
  );
}

export { ReviewSubmissionPanel };
