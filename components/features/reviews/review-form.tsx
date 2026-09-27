"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarSelector } from "./star-selector";

interface ReviewFormProps {
  initialRating?: number;
  initialComment?: string | null;
  isPending: boolean;
  submitLabel: string;
  onSubmit: (data: { rating: number; comment: string | null }) => void;
  onCancel?: () => void;
}

function ReviewForm({
  initialRating = 0,
  initialComment = "",
  isPending,
  submitLabel,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment ?? "");

  const canSubmit = rating > 0 && !isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ rating, comment: comment.trim() || null });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <StarSelector value={rating} onChange={setRating} disabled={isPending} />

      <Textarea
        placeholder="Share your thoughts about this product (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isPending}
        rows={3}
      />

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={!canSubmit}>
          {isPending ? "Submitting..." : submitLabel}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export { ReviewForm };
