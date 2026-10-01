"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOffline } from "next/offline";
import { toast } from "sonner";

import { checkoutSchema, type CheckoutInput } from "@/lib/schemas/checkout";
import { useCartStore } from "@/stores/cart-store";
import { placeOrder } from "./actions";
import { CustomerInfoFields } from "./customer-info-fields";
import { ShippingFields } from "./shipping-fields";
import { PaymentMethodFields } from "./payment-method-fields";
import { CheckoutOrderSummary } from "./checkout-order-summary";

interface CheckoutFormProps {
  initialFullName: string;
  initialPhone: string;
}

function CheckoutForm({ initialFullName, initialPhone }: CheckoutFormProps) {
  const router = useRouter();
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const items = useCartStore((state) => state.items);
  const isOffline = useOffline();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: initialFullName,
      customer_phone: initialPhone,
      payment_method: "cod",
      shipping: { street: "", city: "", postal_code: "", notes: "" },
    },
  });

  useEffect(() => {
    if (!hasHydrated) return;
    if (items.length === 0) {
      router.replace("/cart");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  if (items.length === 0) {
    return null; // redirecting — avoid a flash of an empty checkout form
  }

  async function onSubmit(values: CheckoutInput) {
    const result = await placeOrder(values, items);

    if (!result.ok) {
      toast.error(result.error);
      if (result.field) {
        setError(result.field, { message: result.error });
      }
      return;
    }

    toast.success("Order placed successfully!");
    useCartStore.getState().clearCart();
    router.push(`/checkout/success?order_id=${result.orderId}`);
  }

  const submitLabel = isSubmitting
    ? isOffline
      ? "Placing order (offline, will retry)…"
      : "Placing Order..."
    : "Place Order";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]"
      noValidate
    >
      <div className="flex flex-col gap-8">
        <CustomerInfoFields register={register} errors={errors} />
        <ShippingFields register={register} control={control} errors={errors} />
        <PaymentMethodFields register={register} />
      </div>

      <CheckoutOrderSummary
        items={items}
        isPending={isSubmitting}
        submitLabel={submitLabel}
      />
    </form>
  );
}

export { CheckoutForm };
