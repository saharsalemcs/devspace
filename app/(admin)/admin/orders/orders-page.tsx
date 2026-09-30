import { AdminOrdersTable } from "./admin-orders-table";

export default function AdminOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 text-foreground font-bold">Orders</h1>
      <AdminOrdersTable />
    </div>
  );
}
