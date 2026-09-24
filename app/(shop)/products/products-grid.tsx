"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/features/product-card";
import { useProducts } from "@/hooks/use-products";
import {
  fetchProducts,
  PRODUCTS_PAGE_SIZE,
  productsQueryKey,
} from "@/lib/queries/products";
import { CATALOG_STALE_TIME } from "@/lib/query-config";
import type { ProductFilters, ProductSort } from "@/lib/schemas/product";
import { createClient } from "@/lib/supabase/client";
import { ProductsPagination } from "./products-pagination";

interface ProductsGridProps {
  filters: ProductFilters;
  sort: ProductSort;
  page: number;
}

function ProductsGrid({ filters, sort, page }: ProductsGridProps) {
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useProducts(filters, sort, page);

  const totalPages = data
    ? Math.max(1, Math.ceil(data.count / PRODUCTS_PAGE_SIZE))
    : 1;

  useEffect(() => {
    if (!data || page >= totalPages) return;

    void queryClient
      .query({
        queryKey: productsQueryKey(filters, sort, page + 1),
        queryFn: () => fetchProducts(createClient(), filters, sort, page + 1),
        staleTime: CATALOG_STALE_TIME,
      })
      .catch(() => {});
  }, [data, filters, sort, page, totalPages, queryClient]);

  if (isPending) {
    return (
      <div
        data-slot="products-grid-loading"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {Array.from({ length: PRODUCTS_PAGE_SIZE }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-surface flex flex-col items-center gap-2 rounded-xl border border-neutral-700 py-16 text-center">
        <p className="text-h4 text-foreground">Couldn&apos;t load products</p>
        <p className="text-body-sm text-neutral-400">
          Something went wrong. Please try again.
        </p>
      </div>
    );
  }

  if (!data || data.products.length === 0) {
    return (
      <div className="bg-surface flex flex-col items-center gap-2 rounded-xl border border-neutral-700 py-16 text-center">
        <p className="text-h4 text-foreground">
          No products match your filters
        </p>
        <p className="text-body-sm text-neutral-400">
          Try adjusting or clearing your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div
        data-slot="products-grid"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {data.products.map((product) => (
          <ProductCard
            key={product.id}
            slug={product.slug}
            name={product.name}
            category={product.category?.name ?? "Uncategorized"}
            price={product.price}
            imageUrl={product.image_url}
          />
        ))}
      </div>

      <ProductsPagination page={page} totalPages={totalPages} />
    </div>
  );
}

export { ProductsGrid };
