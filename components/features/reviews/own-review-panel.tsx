"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { RatingStars } from "@/components/features/rating-stars";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ReviewForm } from "./review-form";
import { DeleteReviewDialog } from "./delete-review-dialog";
import type {
  OptimisticReview,
  ReviewsOptimisticAction,
} from "./reviews-section";
import { useUpdateReview } from "@/hooks/reviews/use-update-review";
import { useDeleteOwnReview } from "@/hooks/reviews/use-delete-own-review";

interface OwnReviewPanelProps {
  productId: string;
  review: OptimisticReview;
  dispatchOptimistic: (action: ReviewsOptimisticAction) => void;
}

function OwnReviewPanel({
  productId,
  review,
  dispatchOptimistic,
}: OwnReviewPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateReview = useUpdateReview();
  const deleteOwnReview = useDeleteOwnReview();
  const [isTransitionPending, startTransition] = useTransition();

  function handleUpdate(data: { rating: number; comment: string | null }) {
    startTransition(async () => {
      dispatchOptimistic({
        type: "edit",
        reviewId: review.id,
        rating: data.rating,
        comment: data.comment,
      });
      setIsEditing(false);
      try {
        await updateReview.mutateAsync({
          reviewId: review.id,
          productId,
          ...data,
        });
        toast.success("Review updated.");
      } catch {
        toast.error("Couldn't update your review. Please try again.");
      }
    });
  }

  function handleDelete() {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        dispatchOptimistic({ type: "delete", reviewId: review.id });
        try {
          await deleteOwnReview.mutateAsync({ reviewId: review.id, productId });
          toast.success("Review deleted.");
          resolve();
        } catch {
          toast.error("Couldn't delete your review. Please try again.");
          reject();
        }
      });
    });
  }

  if (isEditing) {
    return (
      <ReviewForm
        initialRating={review.rating}
        initialComment={review.comment}
        submitLabel="Save Changes"
        isPending={isTransitionPending}
        onSubmit={handleUpdate}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div
      data-slot="own-review-panel"
      className="flex flex-col gap-2 border-b border-neutral-800 py-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-body-sm text-foreground font-medium">
              You
            </span>
            <span className="text-caption text-neutral-500">
              {formatDate(review.created_at)}
            </span>
          </div>
          <RatingStars rating={review.rating} size="sm" />
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <DeleteReviewDialog
            isPending={isTransitionPending}
            onConfirm={handleDelete}
            trigger={<Button variant="destructive">Delete</Button>}
          />
        </div>
      </div>

      {review.comment && (
        <p className="text-body-sm text-neutral-300">{review.comment}</p>
      )}
    </div>
  );
}

export { OwnReviewPanel };
