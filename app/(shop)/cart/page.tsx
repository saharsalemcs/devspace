import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { getSession } from "@/lib/supabase/auth";
import { CartView } from "./cart-view";

export const metadata: Metadata = {
  title: "Cart",
};

export default async function CartPage() {
  const session = await getSession();

  return (
    <Container className="flex flex-col gap-8 py-8">
      <h1 className="text-h2 text-foreground font-bold">Your Cart</h1>

      <CartView isLoggedIn={!!session} />
    </Container>
  );
}
