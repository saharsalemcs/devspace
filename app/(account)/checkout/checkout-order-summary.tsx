"use client";

import { calculateCartTotals } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import type { CartLineItem } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";

interface CheckoutOrderSummaryProps {
  items: CartLineItem[];
  isPending: boolean;
  submitLabel: string;
}

function CheckoutOrderSummary({
  items,
  isPending,
  submitLabel,
}: CheckoutOrderSummaryProps) {
  const totals = calculateCartTotals(items);

  return (
    <div
      data-slot="checkout-order-summary"
      className="bg-surface sticky top-24 flex h-fit flex-col gap-4 rounded-xl border border-neutral-700 p-6"
    >
      <h2 className="text-h4 text-foreground font-semibold">Order Summary</h2>

      <div className="flex flex-col gap-2">
        <div className="text-body flex justify-between text-neutral-300">
          <span>Subtotal</span>
          <span className="font-mono">{formatPrice(totals.subtotal)}</span>
        </div>

        {totals.discount > 0 && (
          <div className="text-body text-accent flex justify-between">
            <span>Discount</span>
            <span className="font-mono">-{formatPrice(totals.discount)}</span>
          </div>
        )}
      </div>

      <div className="text-h4 text-foreground flex justify-between border-t border-neutral-700 pt-4">
        <span>Total</span>
        <span className="text-price text-accent font-mono">
          {formatPrice(totals.total)}
        </span>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {submitLabel}
      </Button>
    </div>
  );
}

export { CheckoutOrderSummary };
