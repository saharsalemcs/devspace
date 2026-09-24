import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProductFilters, ProductSort } from "@/lib/schemas/product";
import type { Database } from "@/types/database";
import type { ProductRow } from "@/types/models";
import type { CategoryRow } from "@/types/models";

export const PRODUCTS_PAGE_SIZE = 12;

export interface Product extends ProductRow {
  category: Pick<CategoryRow, "id" | "name" | "slug"> | null;
  average_rating: number | null;
  review_count: number | null;
}

export interface ProductsPage {
  products: Product[];
  count: number;
}

export const productsQueryKey = (
  filters: ProductFilters,
  sort: ProductSort,
  page: number,
) => ["products", filters, sort, page] as const;

export async function fetchProducts(
  supabase: SupabaseClient<Database>,
  filters: ProductFilters,
  sort: ProductSort,
  page: number,
): Promise<ProductsPage> {
  const ratingEmbed =
    sort === "top-rated"
      ? "product_rating_stats!inner"
      : "product_rating_stats";

  let query = supabase
    .from("products")
    .select(
      `*, category:categories(id, name, slug), ${ratingEmbed}(average_rating, review_count)`,
      { count: "exact" },
    )
    .eq("is_active", true);

  const term = filters.search?.replace(/[,()]/g, " ").trim();
  if (term) {
    query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }

  if (filters.categoryIds?.length) {
    query = query.in("category_id", filters.categoryIds);
  }

  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice);
  }

  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "top-rated":
      query = query.order("average_rating", {
        referencedTable: "product_rating_stats",
        ascending: false,
      });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Deterministic tie-break so rows with an identical sort value don't
  // reshuffle between pages.
  query = query.order("id", { ascending: true });

  const from = (page - 1) * PRODUCTS_PAGE_SIZE;
  const to = from + PRODUCTS_PAGE_SIZE - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    products: (data ?? []).map(
      ({ category, product_rating_stats, ...product }) => {
        const stats = product_rating_stats?.[0];
        return {
          ...product,
          category: category ?? null,
          average_rating: stats?.average_rating ?? null,
          review_count: stats?.review_count ?? null,
        };
      },
    ),
    count: count ?? 0,
  };
}
