"use client";

import { useQuery } from "@tanstack/react-query";

import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/features/product-card";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/dialog";
import { fetchProducts, productsQueryKey } from "@/lib/queries/products";
import { CATALOG_STALE_TIME } from "@/lib/query-config";
import type { ProductFilters } from "@/lib/schemas/product";
import { createClient } from "@/lib/supabase/client";
import { useDeskBuilderStore } from "@/stores/desk-builder-store";
import type { CategoryRow } from "@/types/models";
import pluralize from "pluralize";

interface SlotPickerModalProps {
  category: CategoryRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SlotPickerModal({
  category,
  open,
  onOpenChange,
}: SlotPickerModalProps) {
  const selection = useDeskBuilderStore((state) =>
    state.selections.find((item) => item.categoryId === category.id),
  );
  const selectProduct = useDeskBuilderStore((state) => state.selectProduct);

  // Lazy per slot — only fetches once the picker for this category is
  // actually opened (task-breakdown.md § 6.1), and shares its cache key
  // with the /products listing.
  const filters: ProductFilters = { categoryIds: [category.id] };
  const { data, isPending, isError } = useQuery({
    queryKey: productsQueryKey(filters, "newest", 1),
    queryFn: () => fetchProducts(createClient(), filters, "newest", 1),
    staleTime: CATALOG_STALE_TIME,
    enabled: open,
  });

  function handleSelect(product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url: string;
  }) {
    selectProduct({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.image_url,
      categoryId: category.id,
      categoryName: category.name,
    });
    onOpenChange(false);
  }

  const singularName = pluralize.singular(category.name.toLowerCase());
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Choose a {singularName}</ModalTitle>
        </ModalHeader>

        <ModalBody className="max-h-[60vh] overflow-y-auto">
          {isPending && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-danger-500">
              Couldn&apos;t load products. Try again.
            </p>
          )}

          {data && data.products.length === 0 && (
            <p>No {category.name.toLowerCase()} available right now.</p>
          )}

          {data && data.products.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {data.products.map((product) => (
                <ProductCard
                  key={product.id}
                  productId={product.id}
                  slug={product.slug}
                  name={product.name}
                  category={category.name}
                  price={product.price}
                  imageUrl={product.image_url}
                  selected={selection?.productId === product.id}
                  averageRating={product.average_rating}
                  reviewCount={product.review_count}
                  hideAddToCart
                  onSelect={() => handleSelect(product)}
                />
              ))}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export { SlotPickerModal };
