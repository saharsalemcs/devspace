"use client";

import { useOptimistic } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { Review } from "@/lib/queries/reviews";
import { ReviewCard } from "./review-card";
import { useReviews } from "@/hooks/reviews/use-reviews";
import { ReviewSubmissionPanel } from "./review-submission-panel";

export type OptimisticReview = Review & { pending?: boolean };

export type ReviewsOptimisticAction =
  | { type: "add"; review: OptimisticReview }
  | { type: "edit"; reviewId: string; rating: number; comment: string | null }
  | { type: "delete"; reviewId: string };

function reviewsReducer(
  state: OptimisticReview[],
  action: ReviewsOptimisticAction,
): OptimisticReview[] {
  switch (action.type) {
    case "add":
      return [action.review, ...state];
    case "edit":
      return state.map((r) =>
        r.id === action.reviewId
          ? {
              ...r,
              rating: action.rating,
              comment: action.comment,
              pending: true,
            }
          : r,
      );
    case "delete":
      return state.filter((r) => r.id !== action.reviewId);
  }
}

interface ReviewsSectionProps {
  productId: string;
}

function ReviewsSection({ productId }: ReviewsSectionProps) {
  const { data: reviews, isPending, isError } = useReviews(productId);
  const { data: currentUser } = useCurrentUser();

  return (
    <div
      data-slot="reviews-section"
      className="flex flex-col gap-4 border-t border-neutral-700 pt-6"
    >
      <h2 className="text-h4 text-foreground font-semibold">Reviews</h2>

      {isPending ? (
        <ReviewsSectionSkeleton />
      ) : isError ? (
        <p className="text-body-sm text-neutral-400">
          Couldn&apos;t load reviews. Please try again.
        </p>
      ) : (
        <ReviewsSectionBody
          productId={productId}
          reviews={reviews}
          currentUserId={currentUser?.id ?? null}
        />
      )}
    </div>
  );
}

interface ReviewsSectionBodyProps {
  productId: string;
  reviews: Review[];
  currentUserId: string | null;
}

function ReviewsSectionBody({
  productId,
  reviews,
  currentUserId,
}: ReviewsSectionBodyProps) {
  const [optimisticReviews, dispatchOptimistic] = useOptimistic(
    reviews,
    reviewsReducer,
  );

  const ownReview = currentUserId
    ? optimisticReviews.find((r) => r.user_id === currentUserId)
    : undefined;

  const otherReviews = optimisticReviews.filter((r) => r.id !== ownReview?.id);

  return (
    <>
      <ReviewSubmissionPanel
        productId={productId}
        ownReview={ownReview}
        dispatchOptimistic={dispatchOptimistic}
      />

      {optimisticReviews.length === 0 ? (
        <p className="text-body-sm text-neutral-400">
          No reviews yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="flex flex-col">
          {otherReviews.map((review) => (
            <ReviewCard key={review.id} review={review} productId={productId} />
          ))}
        </div>
      )}
    </>
  );
}

function ReviewsSectionSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 border-b border-neutral-800 py-4"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export { ReviewsSection };
