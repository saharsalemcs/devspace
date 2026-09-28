"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { CheckoutInput } from "@/lib/schemas/checkout";

interface CustomerInfoFieldsProps {
  register: UseFormRegister<CheckoutInput>;
  errors: FieldErrors<CheckoutInput>;
}

function CustomerInfoFields({ register, errors }: CustomerInfoFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h4 text-foreground font-semibold">Your Details</h2>

      <FormField
        label="Full Name"
        htmlFor="customer_name"
        error={errors.customer_name}
      >
        <Input
          id="customer_name"
          aria-invalid={!!errors.customer_name || undefined}
          {...register("customer_name")}
        />
      </FormField>

      <FormField
        label="Phone Number"
        htmlFor="customer_phone"
        error={errors.customer_phone}
      >
        <Input
          id="customer_phone"
          type="tel"
          aria-invalid={!!errors.customer_phone || undefined}
          {...register("customer_phone")}
        />
      </FormField>
    </div>
  );
}

export { CustomerInfoFields };
