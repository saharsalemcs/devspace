import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { Container } from "@/components/layout/container";
import {
  fetchFeaturedProducts,
  featuredProductsQueryKey,
} from "@/lib/queries/featured-products";
import { CATALOG_STALE_TIME } from "@/lib/query-config";
import { createClient } from "@/lib/supabase/server";
import { CategoryHighlights } from "./category-highlights";
import { FeaturedProductsGrid } from "./featured-products-grid";
import { HomeHero } from "./home-hero";

export default async function Home() {
  const queryClient = new QueryClient();
  const supabase = await createClient();

  await queryClient
    .query({
      queryKey: featuredProductsQueryKey,
      queryFn: () => fetchFeaturedProducts(supabase),
      staleTime: CATALOG_STALE_TIME,
    })
    .catch(() => {});

  return (
    <div className="flex flex-col">
      <HomeHero />

      <Container className="flex flex-col gap-8 py-16">
        <div>
          <h2 className="text-h2 text-foreground font-bold">
            Featured Products
          </h2>
          <p className="mt-1 text-neutral-400">
            Our top-rated picks, straight from the shop.
          </p>
        </div>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <FeaturedProductsGrid />
        </HydrationBoundary>
      </Container>

      <Container className="flex flex-col gap-8 py-16">
        <div>
          <h2 className="text-h2 text-foreground font-bold">
            Shop by Category
          </h2>
          <p className="mt-1 text-neutral-400">
            Find exactly what your setup needs.
          </p>
        </div>

        <CategoryHighlights />
      </Container>
    </div>
  );
}
