import {
  ShoppingCartIcon,
  CalendarIcon,
  BanknoteIcon,
  UsersIcon,
  PackageIcon,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { fetchAdminDashboardStats } from "@/lib/queries/admin-dashboard";
import { formatPrice } from "@/lib/utils";
import { KpiCard } from "@/components/features/admin/kpi-card";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const stats = await fetchAdminDashboardStats(supabase);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-h2 text-foreground font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={ShoppingCartIcon}
        />
        <KpiCard
          label="Orders This Month"
          value={stats.ordersThisMonth.toLocaleString()}
          icon={CalendarIcon}
        />
        <KpiCard
          label="Revenue (Delivered)"
          value={formatPrice(stats.totalRevenue)}
          icon={BanknoteIcon}
        />
        <KpiCard
          label="Registered Customers"
          value={stats.customerCount.toLocaleString()}
          icon={UsersIcon}
        />
        <KpiCard
          label="Active Products"
          value={stats.activeProductCount.toLocaleString()}
          icon={PackageIcon}
        />
      </div>
    </div>
  );
}
