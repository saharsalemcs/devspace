"use client";

import { useOptimistic, useState, useTransition } from "react";
import { StarIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminReviews } from "@/hooks/admin/use-admin-reviews";
import { useDeleteAdminReview } from "@/hooks/admin/use-delete-admin-review";
import type { AdminReview } from "@/lib/queries/admin-reviews";
import { formatDate } from "@/lib/utils";

function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="flex gap-0.5"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={
            i < rating
              ? "text-accent size-4 fill-current"
              : "size-4 text-neutral-700"
          }
        />
      ))}
    </span>
  );
}

function AdminReviewsList() {
  const { data: reviews, isPending, isError } = useAdminReviews();
  const deleteReview = useDeleteAdminReview();
  const [, startTransition] = useTransition();

  const [reviewToDelete, setReviewToDelete] = useState<AdminReview | null>(
    null,
  );

  const [optimisticReviews, removeOptimistic] = useOptimistic(
    reviews ?? [],
    (state: AdminReview[], deletedId: string) =>
      state.filter((review) => review.id !== deletedId),
  );

  function handleConfirmDelete() {
    if (!reviewToDelete) return;
    const id = reviewToDelete.id;
    setReviewToDelete(null); // close the dialog right away; the row vanishes with it

    startTransition(async () => {
      removeOptimistic(id);
      try {
        await deleteReview.mutateAsync(id);
        toast.success("Review deleted");
      } catch {
        toast.error("Couldn't delete the review. Please try again.");
      }
    });
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-body-sm text-neutral-400">
        Couldn&apos;t load reviews. Please try again.
      </p>
    );
  }

  if (optimisticReviews.length === 0) {
    return <p className="text-body-sm text-neutral-400">No reviews yet.</p>;
  }

  return (
    <>
      {/* Mobile View: Cards Layout (< md breakpoint) */}
      <div className="flex flex-col gap-3 md:hidden">
        {optimisticReviews.map((review) => (
          <div
            key={review.id}
            className="bg-surface flex flex-col gap-3 rounded-xl border border-neutral-700 p-4"
          >
            {/* Header: Product & Rating */}
            <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2">
              <div>
                {review.product ? (
                  <span className="text-body-sm text-foreground hover:text-primary font-medium">
                    {review.product.name}
                  </span>
                ) : (
                  <span className="text-body-sm text-neutral-500">
                    Deleted product
                  </span>
                )}
              </div>
              <Stars rating={review.rating} />
            </div>

            {/* Reviewer & Date */}
            <div className="text-body-sm flex items-center justify-between text-neutral-400">
              <span className="text-neutral-300">
                {review.reviewer?.full_name || "Unknown user"}
              </span>
              <span className="text-caption">
                {formatDate(review.created_at)}
              </span>
            </div>

            {/* Comment */}
            <div className="text-body-sm text-neutral-300">
              {review.comment ? (
                <p className="line-clamp-3">{review.comment}</p>
              ) : (
                <span className="text-neutral-500">—</span>
              )}
            </div>

            {/* Delete Action */}
            <div className="flex justify-end border-t border-neutral-800 pt-3">
              <Button
                variant="destructive"
                size="sm"
                aria-label={`Delete review by ${review.reviewer?.full_name || "unknown user"}`}
                onClick={() => setReviewToDelete(review)}
              >
                <Trash2Icon />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View: Traditional Table (>= md breakpoint) */}
      <div className="bg-surface hidden overflow-x-auto rounded-xl border border-neutral-700 px-6 md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="text-body-sm border-b border-neutral-700 text-neutral-500 uppercase">
              <th className="px-4 py-3 pl-0 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Reviewer</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Comment</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {optimisticReviews.map((review) => (
              <tr
                key={review.id}
                className="border-b border-neutral-800 align-top last:border-b-0"
              >
                <td className="py-3 pr-4">
                  {review.product ? (
                    <span className="text-body-sm text-foreground hover:text-primary">
                      {review.product.name}
                    </span>
                  ) : (
                    <span className="text-body-sm text-neutral-500">
                      Deleted product
                    </span>
                  )}
                </td>
                <td className="text-body-sm py-3 pr-4 whitespace-nowrap text-neutral-300">
                  {review.reviewer?.full_name || "Unknown user"}
                </td>
                <td className="py-3 pr-4">
                  <Stars rating={review.rating} />
                </td>
                <td className="text-body-sm max-w-md py-3 pr-4 text-neutral-300">
                  {review.comment ? (
                    <p className="line-clamp-3">{review.comment}</p>
                  ) : (
                    <span className="text-neutral-500">—</span>
                  )}
                </td>
                <td className="text-body-sm py-3 pr-4 whitespace-nowrap text-neutral-400">
                  {formatDate(review.created_at)}
                </td>
                <td className="py-3 text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    aria-label={`Delete review by ${review.reviewer?.full_name || "unknown user"}`}
                    onClick={() => setReviewToDelete(review)}
                  >
                    <Trash2Icon />
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* One dialog for the whole list, driven by `reviewToDelete`. */}
      <Dialog
        open={reviewToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setReviewToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this review?</DialogTitle>
            <DialogDescription>
              {reviewToDelete?.reviewer?.full_name || "This user"}&apos;s{" "}
              {reviewToDelete?.rating}-star review
              {reviewToDelete?.product
                ? ` of "${reviewToDelete.product.name}"`
                : ""}{" "}
              will be permanently removed, and the product&apos;s rating will be
              recalculated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { AdminReviewsList };
