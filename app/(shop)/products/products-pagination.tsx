"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { IconButton } from "@/components/ui/icon-button";
import { withPageParam } from "@/lib/products-url";

interface ProductsPaginationProps {
  page: number;
  totalPages: number;
}

function ProductsPagination({ page, totalPages }: ProductsPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(nextPage: number) {
    router.push(`/products${withPageParam(searchParams, nextPage)}`, {
      scroll: false,
    });
  }

  return (
    <nav
      data-slot="products-pagination"
      aria-label="Product page navigation"
      className="flex items-center justify-center gap-4"
    >
      <IconButton
        aria-label="Previous page"
        variant="outline"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
      >
        <ChevronLeftIcon />
      </IconButton>

      <span className="text-body-sm text-neutral-300">
        Page {page} of {totalPages}
      </span>

      <IconButton
        aria-label="Next page"
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
      >
        <ChevronRightIcon />
      </IconButton>
    </nav>
  );
}

export { ProductsPagination };
