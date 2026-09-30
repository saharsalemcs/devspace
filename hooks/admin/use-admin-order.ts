"use client";

import { useQuery } from "@tanstack/react-query";

import { adminOrderQueryKey } from "@/lib/queries/admin-orders";
import { fetchOrderDetail, type OrderDetail } from "@/lib/queries/orders";
import { createClient } from "@/lib/supabase/client";

export function useAdminOrder(initialOrder: OrderDetail) {
  return useQuery({
    queryKey: adminOrderQueryKey(initialOrder.id),
    queryFn: () => fetchOrderDetail(createClient(), initialOrder.id),
    initialData: initialOrder,
    staleTime: 30_000,
  });
}
