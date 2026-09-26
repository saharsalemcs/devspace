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
      className="flex items-start gap-3 border-b border-neutral-800 py-4 last:border-b-0 sm:items-center sm:gap-4"
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

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Link
            href={`/products/${item.slug}`}
            className="text-h4 text-foreground hover:text-primary truncate"
          >
            {item.name}
          </Link>
          <p className="text-accent text-base sm:text-lg">
            {formatPrice(item.price)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <QuantityStepper
            quantity={item.quantity}
            onChange={onQuantityChange}
          />
        </div>
      </div>

      <p className="text-foreground hidden text-right sm:block">
        {formatPrice(item.price * item.quantity)}
      </p>

      <IconButton
        aria-label={`Remove ${item.name} from cart`}
        onClick={onRemove}
        className="shrink-0"
      >
        <XIcon />
      </IconButton>
    </div>
  );
}

export { CartItemRow };
