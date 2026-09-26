"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingStars } from "@/components/features/rating-stars";
import { ReviewsSection } from "@/components/features/reviews/reviews-section";
import { useProduct } from "@/hooks/use-product";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductGallery } from "./product-gallery";

interface ProductDetailProps {
  slug: string;
}

function specEntries(specs: unknown): [string, unknown][] {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return [];
  return Object.entries(specs as Record<string, unknown>);
}

function ProductDetail({ slug }: ProductDetailProps) {
  const { data: product, isPending, isError } = useProduct(slug);

  if (isPending) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="bg-surface flex flex-col items-center gap-2 rounded-xl border border-neutral-700 py-16 text-center">
        <p className="text-h4 text-foreground">
          Couldn&apos;t load this product
        </p>
        <p className="text-body-sm text-neutral-400">
          Something went wrong. Please try again.
        </p>
      </div>
    );
  }

  const specs = specEntries(product.specs);
  const reviewCount = product.review_count ?? 0;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery
          images={[product.image_url, ...product.images]}
          alt={product.name}
        />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            {product.category && (
              <Badge variant="neutral" className="w-fit">
                {product.category.name}
              </Badge>
            )}

            <h1 className="text-h2 text-foreground font-bold">
              {product.name}
            </h1>

            {reviewCount > 0 ? (
              <div className="flex items-center gap-2">
                <RatingStars rating={product.average_rating ?? 0} />
                <span className="text-body-sm text-neutral-400">
                  {(product.average_rating ?? 0).toFixed(1)} · {reviewCount}{" "}
                  {reviewCount === 1 ? "review" : "reviews"}
                </span>
              </div>
            ) : (
              <p className="text-body-sm text-neutral-400">No reviews yet</p>
            )}

            <p className="text-price text-accent">
              {formatPrice(product.price)}
            </p>
          </div>

          {product.description && (
            <p className="text-body whitespace-pre-line text-neutral-300">
              {product.description}
            </p>
          )}

          <AddToCartButton
            productName={product.name}
            productId={product.id}
            slug={product.slug}
            price={product.price}
            imageUrl={product.image_url}
            className="w-full sm:w-auto"
          />

          {specs.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-neutral-700 pt-6">
              <h2 className="text-h4 text-foreground font-semibold">
                Specifications
              </h2>
              <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {specs.map(([key, value]) => (
                  <div
                    key={key}
                    className="text-body flex items-baseline justify-between gap-2 border-b border-neutral-800 py-1.5"
                  >
                    <dt className="text-neutral-400">{key}</dt>
                    <dd className="text-foreground text-right">
                      {String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <ReviewsSection productId={product.id} />
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div
      data-slot="product-detail-loading"
      className="grid grid-cols-1 gap-10 lg:grid-cols-2"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  );
}

export { ProductDetail };
