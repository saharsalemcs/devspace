import { Database, Tables } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import { REVIEW_DUPLICATE_ERROR_CODE } from "../query-config";

export type Review = Tables<"reviews"> & {
  profiles: Pick<Tables<"profiles">, "full_name"> | null;
};

function toReview(row: Tables<"reviews">): Review {
  return {
    ...row,
    profiles: row.author_name ? { full_name: row.author_name } : null,
  };
}

export function reviewsQueryKey(productId: string) {
  return ["reviews", productId] as const;
}

export async function fetchReviews(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map(toReview);
}

export type SubmitReviewInput = {
  productId: string;
  rating: number;
  comment: string | null;
};

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
    .select("*")
    .single();

  if (error) {
    if (error.code === REVIEW_DUPLICATE_ERROR_CODE) {
      throw new DuplicateReviewError();
    }
    throw error;
  }

  return toReview(data);
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
    .select("*")
    .single();

  if (error) throw error;

  return toReview(data);
}

export type DeleteOwnReviewInput = {
  reviewId: string;
  productId: string;
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
