"use client";

import { Trash2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CartBundleGroup as CartBundleGroupData } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { CartItemRow } from "./cart-item-row";

interface CartBundleGroupProps {
  bundle: CartBundleGroupData;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onRemoveBundle: () => void;
}

function CartBundleGroup({
  bundle,
  onQuantityChange,
  onRemoveItem,
  onRemoveBundle,
}: CartBundleGroupProps) {
  return (
    <div
      data-slot="cart-bundle-group"
      className="bg-surface flex flex-col gap-2 rounded-xl border border-neutral-700 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <Badge variant="bundle">Desk Build</Badge>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRemoveBundle}
          className="text-danger-500 hover:text-danger-500 hover:bg-danger-500/10"
        >
          <Trash2Icon />
          Remove Bundle
        </Button>
      </div>

      <div className="flex flex-col">
        {bundle.items.map((item) => (
          <CartItemRow
            key={item.productId}
            item={item}
            onQuantityChange={(quantity) =>
              onQuantityChange(item.productId, quantity)
            }
            onRemove={() => onRemoveItem(item.productId)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-1 border-t border-neutral-800 pt-3">
        <div className="text-body-sm flex justify-between text-neutral-400">
          <span>Bundle Subtotal</span>
          <span>{formatPrice(bundle.subtotal)}</span>
        </div>

        {bundle.discount > 0 && (
          <div className="text-body-sm text-accent flex justify-between">
            <span>Bundle Discount (5%)</span>
            <span className="text-body">-{formatPrice(bundle.discount)}</span>
          </div>
        )}

        <div className="text-body text-foreground flex justify-between font-semibold">
          <span>Bundle Total</span>
          <span>{formatPrice(bundle.total)}</span>
        </div>
      </div>
    </div>
  );
}

export { CartBundleGroup };
