"use client";

import type { UseFormRegister } from "react-hook-form";

import type { CheckoutInput } from "@/lib/schemas/checkout";

interface PaymentMethodFieldsProps {
  register: UseFormRegister<CheckoutInput>;
}

function PaymentMethodFields({ register }: PaymentMethodFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h4 text-foreground font-semibold">Payment Method</h2>

      <label className="border-ember-500 bg-surface flex items-center gap-3 rounded-xl border-2 p-4">
        <input
          type="radio"
          value="cod"
          defaultChecked
          className="accent-ember-500 size-4"
          {...register("payment_method")}
        />
        <div className="flex flex-col">
          <span className="text-body text-foreground font-medium">
            Cash on Delivery
          </span>
          <span className="text-body-sm text-neutral-400">
            Pay when your order arrives
          </span>
        </div>
      </label>
    </div>
  );
}

export { PaymentMethodFields };
