"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  ADMIN_ORDERS_QUERY_ROOT,
  updateOrderStatus,
} from "@/lib/queries/admin-orders";
import type { OrderStatus } from "@/lib/order-status";
import { createClient } from "@/lib/supabase/client";

interface UpdateOrderStatusVariables {
  orderId: string;
  status: OrderStatus;
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: UpdateOrderStatusVariables) =>
      updateOrderStatus(createClient(), orderId, status),

    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: [ADMIN_ORDERS_QUERY_ROOT] }),
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
      ]),
  });
}
