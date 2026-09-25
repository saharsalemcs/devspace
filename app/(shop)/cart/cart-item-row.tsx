"use client";

import Image from "next/image";
import Link from "next/link";
import { XIcon } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { formatPrice } from "@/lib/utils";
import type { CartLineItem } from "@/stores/cart-store";
import { QuantityStepper } from "./quantity-stepper";

interface CartItemRowProps {
  item: CartLineItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  return (
    <div
      data-slot="cart-item-row"
      className="flex items-center gap-4 border-b border-neutral-800 py-4 last:border-b-0"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={`/products/${item.slug}`}
          className="text-h4 text-foreground hover:text-primary truncate"
        >
          {item.name}
        </Link>
        <p className="text-price text-accent font-mono">
          {formatPrice(item.price)}
        </p>
      </div>

      <QuantityStepper quantity={item.quantity} onChange={onQuantityChange} />

      <p className="text-price hidden w-24 text-right font-mono text-foreground sm:block">
        {formatPrice(item.price * item.quantity)}
      </p>

      <IconButton aria-label={`Remove ${item.name} from cart`} onClick={onRemove}>
        <XIcon />
      </IconButton>
    </div>
  );
}

export { CartItemRow };
