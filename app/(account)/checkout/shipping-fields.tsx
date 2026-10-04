"use client";

import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EGYPT_GOVERNORATES, type CheckoutInput } from "@/lib/schemas/checkout";

interface ShippingFieldsProps {
  register: UseFormRegister<CheckoutInput>;
  control: Control<CheckoutInput>;
  errors: FieldErrors<CheckoutInput>;
}

function ShippingFields({ register, control, errors }: ShippingFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h4 text-foreground font-semibold">
        Shipping Address
      </h2>

      <FormField
        label="Street Address"
        htmlFor="shipping.street"
        error={errors.shipping?.street}
      >
        <Input
          id="shipping.street"
          aria-invalid={!!errors.shipping?.street || undefined}
          {...register("shipping.street")}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="City"
          htmlFor="shipping.city"
          error={errors.shipping?.city}
        >
          <Input
            id="shipping.city"
            aria-invalid={!!errors.shipping?.city || undefined}
            {...register("shipping.city")}
          />
        </FormField>

        <FormField
          label="Governorate"
          htmlFor="shipping.governorate"
          error={errors.shipping?.governorate}
        >
          <Controller
            control={control}
            name="shipping.governorate"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="shipping.governorate"
                  aria-invalid={!!errors.shipping?.governorate || undefined}
                  className="w-full"
                >
                  <SelectValue placeholder="Select governorate" />
                </SelectTrigger>
                <SelectContent>
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <SelectItem key={gov} value={gov}>
                      {gov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      {/* <FormField
        label="Postal Code (optional)"
        htmlFor="shipping.postal_code"
        error={errors.shipping?.postal_code}
      >
        <Input
          id="shipping.postal_code"
          {...register("shipping.postal_code")}
        />
      </FormField> */}

      <FormField
        label="Delivery Notes (optional)"
        htmlFor="shipping.notes"
        error={errors.shipping?.notes}
      >
        <Textarea
          id="shipping.notes"
          rows={2}
          placeholder="e.g. building number, floor, landmark"
          {...register("shipping.notes")}
        />
      </FormField>
    </div>
  );
}

export { ShippingFields };
