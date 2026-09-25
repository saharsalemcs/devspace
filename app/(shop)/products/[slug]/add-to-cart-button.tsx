"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  productName: string;
  className?: string;
}

function AddToCartButton({ productName, className }: AddToCartButtonProps) {
  return (
    <Button
      size="lg"
      className={className}
      onClick={() => toast.success(`${productName} added to cart`)}
    >
      Add to Cart
    </Button>
  );
}

export { AddToCartButton };
