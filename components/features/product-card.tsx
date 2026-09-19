"use client"

import Image from "next/image"
import Link from "next/link"
import { CheckIcon } from "lucide-react"

import { cn, formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductCardProps {
  slug: string
  name: string
  category: string
  price: number
  imageUrl: string
  imageAlt?: string
  inStock?: boolean
  /** Desk Builder selected state — design-system.md § 3.2 */
  selected?: boolean
  onSelect?: () => void
  onAddToCart?: () => void
  className?: string
}

// design-system.md § 3.2 — Product Card
function ProductCard({
  slug,
  name,
  category,
  price,
  imageUrl,
  imageAlt = name,
  inStock = true,
  selected = false,
  onSelect,
  onAddToCart,
  className,
}: ProductCardProps) {
  const outOfStock = !inStock

  return (
    <div
      data-slot="product-card"
      data-selected={selected || undefined}
      data-out-of-stock={outOfStock || undefined}
      onClick={onSelect}
      className={cn(
        "group/product-card relative flex flex-col gap-3 rounded-xl border bg-surface p-4 transition-all duration-200 ease-out",
        selected
          ? "border-2 border-ember-500 ring-1 ring-ember-500/30"
          : "border-neutral-700 hover:-translate-y-0.5 hover:border-neutral-600 hover:bg-surface-elevated hover:shadow-lg active:translate-y-0 active:shadow-md",
        onSelect && "cursor-pointer",
        className
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
          <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-accent text-white">
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
          className="text-h4 text-foreground hover:text-primary"
        >
          {name}
        </Link>
        <p className="text-price font-mono text-accent">
          {formatPrice(price)}
        </p>
      </div>

      <Button
        variant="ghost"
        disabled={outOfStock}
        className={cn("mt-auto", outOfStock && "opacity-40")}
        onClick={(e) => {
          e.stopPropagation()
          onAddToCart?.()
        }}
      >
        Add to Cart
      </Button>
    </div>
  )
}

// Loading placeholder matching the ProductCard layout, for product grids.
function ProductCardSkeleton() {
  return (
    <div
      data-slot="product-card-skeleton"
      className="flex flex-col gap-3 rounded-xl border border-neutral-700 bg-surface p-4"
    >
      <Skeleton className="aspect-square rounded-lg" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-1/4" />
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  )
}

export { ProductCard, ProductCardSkeleton }
