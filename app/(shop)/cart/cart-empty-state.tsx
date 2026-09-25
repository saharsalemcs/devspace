import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

function CartEmptyState() {
  return (
    <div
      data-slot="cart-empty-state"
      className="bg-surface flex flex-col items-center gap-4 rounded-xl border border-neutral-700 py-20 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-neutral-800">
        <ShoppingCartIcon className="size-6 text-neutral-400" />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-h4 text-foreground">Your cart is empty</p>
        <p className="text-body-sm text-neutral-400">
          Browse our products to start building your setup.
        </p>
      </div>

      <Button render={<Link href="/products" />} nativeButton={false}>
        Continue Shopping
      </Button>
    </div>
  );
}

export { CartEmptyState };
