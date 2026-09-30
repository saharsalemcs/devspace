import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminProductsTable } from "./admin-products-table";

export default function AdminProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-foreground font-bold">Products</h1>
        <Button render={<Link href="/admin/products/new" />}>
          <PlusIcon />
          Create Product
        </Button>
      </div>

      <AdminProductsTable />
    </div>
  );
}
