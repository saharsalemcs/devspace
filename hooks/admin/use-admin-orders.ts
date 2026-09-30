"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  adminOrdersQueryKey,
  fetchAdminOrders,
  type AdminOrderStatusFilter,
} from "@/lib/queries/admin-orders";
import { createClient } from "@/lib/supabase/client";

export function useAdminOrders(status: AdminOrderStatusFilter) {
  return useQuery({
    queryKey: adminOrdersQueryKey(status),
    queryFn: () => fetchAdminOrders(createClient(), status),
    placeholderData: keepPreviousData,
  });
}
