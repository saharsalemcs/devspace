"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchReviews, reviewsQueryKey } from "@/lib/queries/reviews";
import { CATALOG_STALE_TIME } from "@/lib/query-config";
import { createClient } from "@/lib/supabase/client";

export type { Review } from "@/lib/queries/reviews";
export { reviewsQueryKey };

export function useReviews(productId: string) {
  return useQuery({
    queryKey: reviewsQueryKey(productId),
    queryFn: () => fetchReviews(createClient(), productId),
    staleTime: CATALOG_STALE_TIME,
    enabled: Boolean(productId),
  });
}
