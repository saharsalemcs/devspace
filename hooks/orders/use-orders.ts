"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchOrders } from "@/lib/queries/orders";
import { createClient } from "@/lib/supabase/client";

export function ordersQueryKey() {
  return ["orders"] as const;
}

export function useOrders() {
  return useQuery({
    queryKey: ordersQueryKey(),
    queryFn: () => fetchOrders(createClient()),
  });
}
