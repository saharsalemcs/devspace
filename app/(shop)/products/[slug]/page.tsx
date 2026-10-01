import { notFound } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { CATALOG_STALE_TIME } from "@/lib/query-config";
import { fetchProduct, productQueryKey } from "@/lib/queries/product";
import { createClient } from "@/lib/supabase/server";
import { ProductDetail } from "./product-detail";

type ProductPageProps = PageProps<"/products/[slug]">;

export async function generateMetadata(
  props: ProductPageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const supabase = await createClient();

  const product = await fetchProduct(supabase, slug).catch(() => null);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const title = product.name;
  const description =
    product.description || `Buy ${product.name} at the best price.`;
  const image = product.images?.[0] || product.image_url;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

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
