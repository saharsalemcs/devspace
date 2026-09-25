"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  slug: string;
  price: number;
  imageUrl: string;
  className?: string;
}

function AddToCartButton({
  productId,
  productName,
  slug,
  price,
  imageUrl,
  className,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  function handleClick() {
    addItem({
      id: productId,
      name: productName,
      slug,
      price,
      imageUrl,
    });
    toast.success(`${productName} added to cart`);
  }

  return (
    <Button size="lg" className={className} onClick={handleClick}>
      Add to Cart
    </Button>
  );
}

export { AddToCartButton };
