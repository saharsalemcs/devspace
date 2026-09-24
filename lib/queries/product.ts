import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { CategoryRow, ProductRow } from "@/types/models";

export interface ProductDetail extends ProductRow {
  category: Pick<CategoryRow, "id" | "name" | "slug"> | null;
  average_rating: number | null;
  review_count: number | null;
}

export const productQueryKey = (slug: string) => ["product", slug] as const;

export async function fetchProduct(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<ProductDetail | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(id, name, slug), product_rating_stats(average_rating, review_count)",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { category, product_rating_stats, ...product } = data;
  const stats = product_rating_stats?.[0];

  return {
    ...product,
    category: category ?? null,
    average_rating: stats?.average_rating ?? null,
    review_count: stats?.review_count ?? null,
  };
}
