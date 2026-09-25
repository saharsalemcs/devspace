"use client";

import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { useCartItemCount } from "@/stores/cart-store";

function CartLink() {
  const itemCount = useCartItemCount();

  return (
    <IconButton
      aria-label={itemCount > 0 ? `View cart, ${itemCount} items` : "View cart"}
      render={<Link href="/cart" />}
      nativeButton={false}
      className="relative"
    >
      <ShoppingCartIcon className="size-5" />

      {itemCount > 0 && (
        <span
          data-slot="cart-badge"
          className="bg-accent absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold text-white"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </IconButton>
  );
}

export { CartLink };
