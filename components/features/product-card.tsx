"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { CheckIcon } from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProduct, productQueryKey } from "@/lib/queries/product";
import { CATALOG_STALE_TIME } from "@/lib/query-config";
import { createClient } from "@/lib/supabase/client";
import { AddToCartButton } from "@/app/(shop)/products/[slug]/add-to-cart-button";
import { RatingStars } from "./rating-stars";

interface ProductCardProps {
  slug: string;
  name: string;
  productId: string;
  category: string;
  price: number;
  imageUrl: string;
  imageAlt?: string;
  inStock?: boolean;
  averageRating?: number | null;
  reviewCount?: number | null;

  selected?: boolean;
  onSelect?: () => void;
  onAddToCart?: () => void;
  /** Desk Builder slot picker: the card itself is the "pick this" action. */
  hideAddToCart?: boolean;
  className?: string;
}

function ProductCard({
  slug,
  name,
  productId,
  category,
  price,
  averageRating,
  reviewCount,
  imageUrl,
  imageAlt = name,
  inStock = true,
  selected = false,
  onSelect,
  hideAddToCart = false,
  className,
}: ProductCardProps) {
  const outOfStock = !inStock;
  const queryClient = useQueryClient();

  function prefetchProduct() {
    queryClient
      .query({
        queryKey: productQueryKey(slug),
        queryFn: () => fetchProduct(createClient(), slug),
        staleTime: CATALOG_STALE_TIME,
      })
      .catch(() => {});
  }

  return (
    <div
      data-slot="product-card"
      data-selected={selected || undefined}
      data-out-of-stock={outOfStock || undefined}
      onClick={onSelect}
      className={cn(
        "group/product-card bg-surface relative flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200 ease-out",
        selected
          ? "border-ember-500 ring-ember-500/30 border-2 ring-1"
          : "hover:bg-surface-elevated border-neutral-700 hover:-translate-y-0.5 hover:border-neutral-600 hover:shadow-lg active:translate-y-0 active:shadow-md",
        onSelect && "cursor-pointer",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-800">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className={cn("object-cover", outOfStock && "opacity-40")}
        />

        {selected && (
          <span className="bg-accent absolute top-2 right-2 flex size-6 items-center justify-center rounded-full text-white">
            <CheckIcon className="size-3.5" />
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Badge variant="neutral">Out of Stock</Badge>
          </div>
        )}
      </div>

      <div className={cn("flex flex-col gap-1", outOfStock && "opacity-40")}>
        <p className="text-caption text-neutral-400 uppercase">{category}</p>
        <Link
          href={`/products/${slug}`}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={prefetchProduct}
          onFocus={prefetchProduct}
          className="text-foreground hover:text-primary text-xl"
        >
          {name}
        </Link>

        {reviewCount ? (
          <div className="flex items-center gap-1.5">
            <RatingStars rating={averageRating ?? 0} size="sm" />
            <span className="text-caption text-neutral-400">
              ({reviewCount})
            </span>
          </div>
        ) : null}

        <p className="text-accent">{formatPrice(price)}</p>
      </div>

      {!hideAddToCart && (
        <AddToCartButton
          // disabled={outOfStock}
          productName={name}
          productId={productId}
          slug={slug}
          price={price}
          imageUrl={imageUrl}
          className={cn("mt-auto w-full sm:w-auto", outOfStock && "opacity-40")}
        />
      )}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div
      data-slot="product-card-skeleton"
      className="bg-surface flex flex-col gap-3 rounded-xl border border-neutral-700 p-4"
    >
      <Skeleton className="aspect-square rounded-lg" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-1/4" />
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export { ProductCard, ProductCardSkeleton };
