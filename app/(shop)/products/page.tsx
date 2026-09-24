import type { Metadata } from "next";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { Container } from "@/components/layout/container";
import { CATALOG_STALE_TIME } from "@/lib/query-config";
import { fetchProducts, productsQueryKey } from "@/lib/queries/products";
import { parseProductSearchParams } from "@/lib/schemas/product";
import { createClient } from "@/lib/supabase/server";
import { ProductsFiltersSidebar } from "./products-filters-sidebar";
import { ProductsGrid } from "./products-grid";
import { ProductsToolbar } from "./products-toolbar";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage(props: PageProps<"/products">) {
  const rawSearchParams = await props.searchParams;
  const { filters, sort, page } = parseProductSearchParams(rawSearchParams);

  const queryClient = new QueryClient();
  const supabase = await createClient();

  await queryClient
    .query({
      queryKey: productsQueryKey(filters, sort, page),
      queryFn: () => fetchProducts(supabase, filters, sort, page),
      staleTime: CATALOG_STALE_TIME,
    })
    .catch(() => {});

  return (
    <Container className="flex flex-col gap-8 py-8">
      <div>
        <h1 className="text-h2 text-foreground font-bold">Products</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Screens, keyboards, mice, lighting, desks and accessories for your
          setup.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <ProductsFiltersSidebar />

        <div className="flex min-w-0 flex-col gap-6">
          <ProductsToolbar />

          <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductsGrid filters={filters} sort={sort} page={page} />
          </HydrationBoundary>
        </div>
      </div>
    </Container>
  );
}
