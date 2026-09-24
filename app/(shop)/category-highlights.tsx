"use client";

import {
  Box,
  Keyboard,
  LampDesk,
  Monitor,
  Mouse,
  Table,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/use-categories";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  monitor: Monitor,
  keyboard: Keyboard,
  mouse: Mouse,
  "lamp-desk": LampDesk,
  table: Table,
  box: Box,
};

function CategoryHighlights() {
  const { data, isPending, isError } = useCategories();

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !data || data.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {data.map((category) => {
        const Icon = CATEGORY_ICONS[category.icon_name ?? ""] ?? Box;

        return (
          <Link
            key={category.id}
            href={`/products?category=${category.id}`}
            className="group bg-surface hover:bg-surface-elevated flex flex-col items-center gap-3 rounded-xl border border-neutral-700 p-6 text-center transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-600 hover:shadow-lg active:translate-y-0 active:shadow-md"
          >
            <span className="text-primary group-hover:bg-ember-500/15 flex size-12 items-center justify-center rounded-full bg-neutral-800 transition-colors">
              <Icon className="size-6" />
            </span>
            <span className="text-h4 text-foreground">{category.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

export { CategoryHighlights };
