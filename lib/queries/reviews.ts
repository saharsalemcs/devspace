import { Database, Tables } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Review = Tables<"reviews"> & {
  profiles: Pick<Tables<"profiles">, "full_name"> | null;
};

export function reviewsQueryKey(productId: string) {
  return ["reviews", productId] as const;
}

export async function fetchReviews(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...row,
    profiles: Array.isArray(row.profiles)
      ? (row.profiles[0] ?? null)
      : row.profiles,
  }));
}

export type SubmitReviewInput = {
  productId: string;
  rating: number;
  comment: string | null;
};

export const REVIEW_DUPLICATE_ERROR_CODE = "23505";

export class DuplicateReviewError extends Error {
  constructor() {
    super("You've already reviewed this product.");
    this.name = "DuplicateReviewError";
  }
}

export async function submitReview(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: SubmitReviewInput,
): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: input.productId,
      user_id: userId,
      rating: input.rating,
      comment: input.comment,
    })
    .select("*, profiles(full_name)")
    .single();

  if (error) {
    if (error.code === REVIEW_DUPLICATE_ERROR_CODE) {
      throw new DuplicateReviewError();
    }
    throw error;
  }

  return {
    ...data,
    profiles: Array.isArray(data.profiles)
      ? (data.profiles[0] ?? null)
      : data.profiles,
  };
}

export type UpdateReviewInput = {
  reviewId: string;
  productId: string; // needed to invalidate the right query key
  rating: number;
  comment: string | null;
};

export async function updateReview(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: UpdateReviewInput,
): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .update({
      rating: input.rating,
      comment: input.comment,
    })
    .eq("id", input.reviewId)
    .eq("user_id", userId)
    .select("*, profiles(full_name)")
    .single();

  if (error) throw error;

  return {
    ...data,
    profiles: Array.isArray(data.profiles)
      ? (data.profiles[0] ?? null)
      : data.profiles,
  };
}

export type DeleteOwnReviewInput = {
  reviewId: string;
  productId: string; // needed to invalidate the right query key
};

export async function deleteOwnReview(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: DeleteOwnReviewInput,
): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", input.reviewId)
    .eq("user_id", userId);

  if (error) throw error;
}

export type DeleteReviewInput = {
  reviewId: string;
  productId: string;
};

export async function deleteReview(
  supabase: SupabaseClient<Database>,
  input: DeleteReviewInput,
): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", input.reviewId);

  if (error) throw error;
}
