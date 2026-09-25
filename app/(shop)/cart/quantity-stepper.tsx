"use client";

import { MinusIcon, PlusIcon } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";

interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
}

function QuantityStepper({ quantity, onChange }: QuantityStepperProps) {
  return (
    <div
      data-slot="quantity-stepper"
      className="border-input inline-flex items-center rounded-lg border"
    >
      <IconButton
        aria-label="Decrease quantity"
        size="icon-sm"
        onClick={() => onChange(quantity - 1)}
        className="rounded-r-none"
      >
        <MinusIcon />
      </IconButton>

      <span className="text-body-sm w-8 text-center font-mono tabular-nums">
        {quantity}
      </span>

      <IconButton
        aria-label="Increase quantity"
        size="icon-sm"
        onClick={() => onChange(quantity + 1)}
        className="rounded-l-none"
      >
        <PlusIcon />
      </IconButton>
    </div>
  );
}

export { QuantityStepper };
