import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export interface AdminReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  product: { id: string; name: string; slug: string } | null;
  reviewer: { full_name: string | null } | null;
}

export const ADMIN_REVIEWS_QUERY_ROOT = "admin-reviews";

export function adminReviewsQueryKey() {
  return [ADMIN_REVIEWS_QUERY_ROOT] as const;
}

const REVIEWS_LIMIT = 100;

export async function fetchAdminReviews(
  supabase: SupabaseClient<Database>,
): Promise<AdminReview[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, rating, comment, created_at, product:products(id, name, slug), reviewer:profiles(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(REVIEWS_LIMIT);

  if (error) throw error;
  return data ?? [];
}

export async function deleteReviewAsAdmin(
  supabase: SupabaseClient<Database>,
  reviewId: string,
): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .select("id")
    .single();

  if (error) throw error;
}
