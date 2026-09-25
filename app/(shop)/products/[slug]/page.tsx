import { notFound } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { Container } from "@/components/layout/container";
import { CATALOG_STALE_TIME } from "@/lib/query-config";
import { fetchProduct, productQueryKey } from "@/lib/queries/product";
import { createClient } from "@/lib/supabase/server";
import { ProductDetail } from "./product-detail";

export default async function ProductDetailPage(
  props: PageProps<"/products/[slug]">,
) {
  const { slug } = await props.params;

  const queryClient = new QueryClient();
  const supabase = await createClient();

  const product = await queryClient
    .query({
      queryKey: productQueryKey(slug),
      queryFn: () => fetchProduct(supabase, slug),
      staleTime: CATALOG_STALE_TIME,
    })
    .catch(() => null);

  if (!product) notFound();

  return (
    <Container className="py-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductDetail slug={slug} />
      </HydrationBoundary>
    </Container>
  );
}
