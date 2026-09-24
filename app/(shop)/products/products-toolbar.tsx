"use client";

import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { withProductParams } from "@/lib/products-url";
import { PRODUCT_SORT_VALUES, type ProductSort } from "@/lib/schemas/product";

const SORT_LABELS: Record<ProductSort, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "top-rated": "Top Rated",
};

function ProductsToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentSort =
    (searchParams.get("sort") as ProductSort | null) ?? "newest";

  const [search, setSearch] = useState(currentSearch);
  const [syncedSearch, setSyncedSearch] = useState(currentSearch);
  if (currentSearch !== syncedSearch) {
    setSyncedSearch(currentSearch);
    setSearch(currentSearch);
  }

  // Debounce so every keystroke doesn't push a new URL/refetch.
  useEffect(() => {
    if (search === currentSearch) return;
    const timeout = setTimeout(() => {
      router.push(
        `/products${withProductParams(searchParams, { q: search || undefined })}`,
        { scroll: false },
      );
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleSortChange(value: string | null) {
    if (!value) return;
    router.push(
      `/products${withProductParams(searchParams, {
        sort: value === "newest" ? undefined : (value as ProductSort),
      })}`,
      { scroll: false },
    );
  }

  return (
    <div
      data-slot="products-toolbar"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="relative max-w-sm flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-neutral-400" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="pl-8"
        />
      </div>

      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger aria-label="Sort products" className="w-full sm:w-52">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {PRODUCT_SORT_VALUES.map((value) => (
            <SelectItem key={value} value={value}>
              {SORT_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { ProductsToolbar };
