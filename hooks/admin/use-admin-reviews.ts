"use client";

import { useQuery } from "@tanstack/react-query";

import {
  adminReviewsQueryKey,
  fetchAdminReviews,
} from "@/lib/queries/admin-reviews";
import { createClient } from "@/lib/supabase/client";

export function useAdminReviews() {
  return useQuery({
    queryKey: adminReviewsQueryKey(),
    queryFn: () => fetchAdminReviews(createClient()),
  });
}
