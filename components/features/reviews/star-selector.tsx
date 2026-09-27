"use client";

import { useState } from "react";
import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function StarSelector({ value, onChange, disabled }: StarSelectorProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const displayValue = hovered ?? value;

  return (
    <div
      data-slot="star-selector"
      role="radiogroup"
      aria-label="Rating"
      className="flex items-center gap-1"
      onMouseLeave={() => setHovered(null)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = displayValue >= starValue;

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            disabled={disabled}
            className="disabled:cursor-not-allowed disabled:opacity-50"
            onMouseEnter={() => setHovered(starValue)}
            onClick={() => onChange(starValue)}
          >
            <StarIcon
              className={cn(
                "size-6 transition-colors",
                filled
                  ? "fill-ember-500 text-ember-500"
                  : "fill-transparent text-neutral-600",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export { StarSelector };
