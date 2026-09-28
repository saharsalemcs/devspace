import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { fetchOrderSummary } from "@/lib/queries/orders";
import { formatPrice, formatDate } from "@/lib/utils";

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ order_id?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { order_id } = await searchParams;
  const supabase = await createClient();

  const order = order_id ? await fetchOrderSummary(supabase, order_id) : null;

  if (!order) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-20 text-center">
        <h1 className="text-h3 text-foreground font-bold">
          We couldn&apos;t find that order
        </h1>
        <p className="text-body-sm text-neutral-400">
          The link may be incorrect, or the order doesn&apos;t belong to this
          account.
        </p>
        <Button render={<Link href="/account/orders" />}>
          View Your Orders
        </Button>
      </div>
    );
  }

  const orderNumber = order.id.slice(0, 8).toUpperCase();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-20 text-center">
      <div className="bg-success-500/10 flex size-16 items-center justify-center rounded-full">
        <CheckCircle2Icon className="text-success-500 size-8" />
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-h2 text-foreground font-bold">
          Your order is confirmed
        </h1>
        <p className="text-body text-neutral-400">
          Order #{orderNumber} · placed {formatDate(order.created_at)}
        </p>
      </div>

      <div className="bg-surface flex w-full flex-col gap-3 rounded-xl border border-neutral-700 p-6">
        <div className="text-body flex justify-between text-neutral-300">
          <span>Total Paid (Cash on Delivery)</span>
          <span className="font-mono">{formatPrice(order.total_price)}</span>
        </div>
        <div className="text-body flex justify-between text-neutral-300">
          <span>Estimated Delivery</span>
          <span>3–5 business days</span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          className="w-full"
          render={<Link href={`/account/orders/${order.id}`} />}
        >
          View Order
        </Button>
        <Button render={<Link href="/products" />}>Continue Shopping</Button>
      </div>
    </div>
  );
}
