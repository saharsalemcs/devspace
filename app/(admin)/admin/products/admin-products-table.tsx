"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminProducts } from "@/hooks/admin/use-admin-products";
import { AdminProductRow } from "@/components/features/admin/admin-product-row";
import { AdminProductCard } from "@/components/features/admin/admin-product-card";

function AdminProductsTable() {
  const [search, setSearch] = useState("");
  const { data: products, isPending, isError } = useAdminProducts(search);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500" />
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-body-sm text-neutral-400">
          Couldn&apos;t load products. Please try again.
        </p>
      ) : products.length === 0 ? (
        <p className="text-body-sm text-neutral-400">
          {search ? "No products match your search." : "No products yet."}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {products.map((product) => (
              <AdminProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="bg-surface hidden overflow-x-auto rounded-xl border border-neutral-700 px-6 md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="text-body-sm border-b border-neutral-700 text-neutral-500 uppercase">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="px-4">
                {products.map((product) => (
                  <AdminProductRow key={product.id} product={product} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export { AdminProductsTable };
