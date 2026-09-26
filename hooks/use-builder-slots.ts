"use client";

import { useCategories } from "@/hooks/use-categories";

// Desk Builder slots are just categories flagged `is_builder_slot` —
export function useBuilderSlots() {
  const query = useCategories();

  return {
    ...query,
    data: query.data?.filter((category) => category.is_builder_slot),
  };
}
