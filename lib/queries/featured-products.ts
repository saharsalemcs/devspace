import type { SupabaseClient } from "@supabase/supabase-js";

import type { Product } from "@/lib/queries/products";
import type { Database } from "@/types/database";
import { FEATURED_PRODUCTS_LIMIT } from "../query-config";

export const featuredProductsQueryKey = ["featured-products"] as const;

// this query will be used in client component `use-featured-products hook` and server component `Home page` so it will receive a pure supabase query as a parameter
export async function fetchFeaturedProducts(
  supabase: SupabaseClient<Database>,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(id, name, slug), product_rating_stats!inner(average_rating, review_count)",
    )
    .eq("is_active", true)
    .order("average_rating", {
      referencedTable: "product_rating_stats",
      ascending: false,
    })
    .order("id", { ascending: true })
    .limit(FEATURED_PRODUCTS_LIMIT);

  if (error) throw error;

  return (data ?? []).map(({ category, product_rating_stats, ...product }) => {
    const stats = product_rating_stats?.[0];
    return {
      ...product,
      category: category ?? null,
      average_rating: stats?.average_rating ?? null,
      review_count: stats?.review_count ?? null,
    };
  });
}
