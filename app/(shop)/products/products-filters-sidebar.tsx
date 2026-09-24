"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/use-categories";
import { toggleCategoryParam, withProductParams } from "@/lib/products-url";
import { cn } from "@/lib/utils";

function ProductsFiltersSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categories, isPending: categoriesPending } = useCategories();

  const selectedCategoryIds = new Set(searchParams.getAll("category"));
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  const hasActiveFilters =
    selectedCategoryIds.size > 0 || minPrice !== "" || maxPrice !== "";

  function toggleCategory(categoryId: string) {
    router.push(`/products${toggleCategoryParam(searchParams, categoryId)}`, {
      scroll: false,
    });
  }

  function applyPriceRange() {
    router.push(
      `/products${withProductParams(searchParams, {
        minPrice: minPriceInput || undefined,
        maxPrice: maxPriceInput || undefined,
      })}`,
      { scroll: false },
    );
  }

  function clearFilters() {
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push("/products", { scroll: false });
  }

  return (
    <aside
      data-slot="products-filters-sidebar"
      className="flex flex-col gap-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-h4 font-semibold text-foreground">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-body-sm text-accent hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-caption text-neutral-400 uppercase">Category</h3>
        {categoriesPending ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {categories?.map((category) => {
              const inputId = `category-${category.id}`;
              const checked = selectedCategoryIds.has(category.id);
              return (
                <div key={category.id} className="group flex items-center gap-2">
                  <Checkbox
                    id={inputId}
                    checked={checked}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label
                    htmlFor={inputId}
                    className={cn(
                      "text-body-sm mb-0 cursor-pointer font-normal text-neutral-300",
                      checked && "text-foreground",
                    )}
                  >
                    {category.name}
                  </Label>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-caption text-neutral-400 uppercase">
          Price range (EGP)
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            onBlur={applyPriceRange}
            onKeyDown={(e) => e.key === "Enter" && applyPriceRange()}
            aria-label="Minimum price"
          />
          <span className="text-neutral-400">–</span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            onBlur={applyPriceRange}
            onKeyDown={(e) => e.key === "Enter" && applyPriceRange()}
            aria-label="Maximum price"
          />
        </div>
      </div>
    </aside>
  );
}

export { ProductsFiltersSidebar };
