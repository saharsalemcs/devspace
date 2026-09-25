import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md";
  className?: string;
}

function RatingStars({ rating, size = "sm", className }: RatingStarsProps) {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div
      data-slot="rating-stars"
      className={cn("flex items-center", className)}
      role="img"
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = rounded >= i + 1;
        return (
          <StarIcon
            key={i}
            className={cn(
              size === "sm" ? "size-4" : "size-5",
              filled
                ? "fill-ember-500 text-ember-500"
                : "fill-transparent text-neutral-600",
            )}
          />
        );
      })}
    </div>
  );
}

export { RatingStars };
