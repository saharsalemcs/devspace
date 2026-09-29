"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { useUpdateProductActive } from "@/hooks/admin/use-update-product-active";
import { useDeleteProduct } from "@/hooks/admin/use-delete-product";
import type { AdminProduct } from "@/lib/queries/admin-products";

export function useAdminProductActions(product: AdminProduct) {
  const updateActive = useUpdateProductActive();
  const deleteProduct = useDeleteProduct();
  const [isTransitionPending, startTransition] = useTransition();

  const [optimisticIsActive, setOptimisticIsActive] = useOptimistic(
    product.is_active,
  );

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      setOptimisticIsActive(checked);
      try {
        await updateActive.mutateAsync({
          productId: product.id,
          isActive: checked,
        });
      } catch {
        toast.error("Couldn't update product status. Please try again.");
      }
    });
  }

  function handleDelete() {
    return deleteProduct.mutateAsync(product.id).catch(() => {
      toast.error(
        "Couldn't delete product. It may be referenced by existing orders.",
      );
      throw new Error("delete failed"); // re-throw so the confirm dialog stays open
    });
  }

  return {
    optimisticIsActive,
    handleToggle,
    isTogglePending: isTransitionPending,
    handleDelete,
    isDeletePending: deleteProduct.isPending,
  };
}
