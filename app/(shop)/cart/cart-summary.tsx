import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CartTotals } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

interface CartSummaryProps {
  totals: CartTotals;
  isLoggedIn: boolean;
}

function CartSummary({ totals, isLoggedIn }: CartSummaryProps) {
  const checkoutHref = isLoggedIn ? "/checkout" : "/login?next=/checkout";

  return (
    <div
      data-slot="cart-summary"
      className="bg-surface sticky top-24 flex h-fit flex-col gap-4 rounded-xl border border-neutral-700 p-6"
    >
      <h2 className="text-h4 text-foreground font-semibold">Order Summary</h2>

      <div className="flex flex-col gap-2">
        <div className="text-body flex justify-between text-neutral-300">
          <span>Subtotal</span>
          <span>{formatPrice(totals.subtotal)}</span>
        </div>

        {totals.discount > 0 && (
          <div className="text-body text-accent flex justify-between">
            <span>Bundle Discount</span>
            <span>-{formatPrice(totals.discount)}</span>
          </div>
        )}
      </div>

      <Separator />

      <div className="text-h4 text-foreground flex justify-between">
        <span>Total</span>
        <span className="text-accent text-xl">{formatPrice(totals.total)}</span>
      </div>

      <Button
        size="lg"
        className="group w-full"
        render={<Link href={checkoutHref} />}
        nativeButton={false}
      >
        Proceed to Checkout
        <ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-1" />
      </Button>

      {!isLoggedIn && (
        <p className="text-caption text-center text-neutral-400">
          You&apos;ll need to log in to complete your order.
        </p>
      )}
    </div>
  );
}

export { CartSummary };
