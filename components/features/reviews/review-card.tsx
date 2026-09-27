"use client";

import { TrashIcon } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { RatingStars } from "@/components/features/rating-stars";
import { DeleteReviewDialog } from "./delete-review-dialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatDate } from "@/lib/utils";
import type { Review } from "@/lib/queries/reviews";
import { useDeleteReview } from "@/hooks/reviews/use-delete-review";

interface ReviewCardProps {
  review: Review;
  productId: string;
}

function ReviewCard({ review, productId }: ReviewCardProps) {
  const { data: currentUser } = useCurrentUser();
  const deleteReview = useDeleteReview();

  const isAdmin = currentUser?.role === "admin";
  const reviewerName = review.profiles?.full_name ?? "Anonymous";
  console.log(reviewerName);
  return (
    <div
      data-slot="review-card"
      className="flex flex-col gap-2 border-b border-neutral-800 py-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-body-sm text-foreground font-medium">
              {reviewerName}
            </span>
            <span className="text-caption text-neutral-500">
              {formatDate(review.created_at)}
            </span>
          </div>
          <RatingStars rating={review.rating} size="sm" />
        </div>

        {isAdmin && (
          <DeleteReviewDialog
            isPending={deleteReview.isPending}
            onConfirm={() =>
              deleteReview.mutateAsync({ reviewId: review.id, productId })
            }
            trigger={
              <IconButton
                aria-label="Delete review"
                size="icon-lg"
                variant="destructive"
              >
                <TrashIcon />
              </IconButton>
            }
          />
        )}
      </div>

      {review.comment && (
        <p className="text-body-sm text-neutral-300">{review.comment}</p>
      )}
    </div>
  );
}

export { ReviewCard };
