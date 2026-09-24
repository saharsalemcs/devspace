"use client";

import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/features/product-card";
import { useFeaturedProducts } from "@/hooks/use-featured-products";
import { FEATURED_PRODUCTS_LIMIT } from "@/lib/query-config";

function FeaturedProductsGrid() {
  const { data, isPending, isError } = useFeaturedProducts();

  if (isPending) {
    return (
      <div
        data-slot="featured-products-grid-loading"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {Array.from({ length: FEATURED_PRODUCTS_LIMIT }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-surface flex flex-col items-center gap-2 rounded-xl border border-neutral-700 py-16 text-center">
        <p className="text-h4 text-foreground">
          Couldn&apos;t load featured products
        </p>
        <p className="text-body-sm text-neutral-400">
          Something went wrong. Please try again.
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-surface flex flex-col items-center gap-2 rounded-xl border border-neutral-700 py-16 text-center">
        <p className="text-h4 text-foreground">No featured products yet</p>
        <p className="text-body-sm text-neutral-400">
          Check back soon — new arrivals are on the way.
        </p>
      </div>
    );
  }

  return (
    <div
      data-slot="featured-products-grid"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
    >
      {data.map((product) => (
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
  );
}

export { FeaturedProductsGrid };
