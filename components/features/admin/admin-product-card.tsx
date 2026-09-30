"use client";

import Image from "next/image";
import Link from "next/link";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAdminProductActions } from "@/hooks/admin/use-admin-product-actions";
import { formatPrice } from "@/lib/utils";
import type { AdminProduct } from "@/lib/queries/admin-products";
import { DeleteProductDialog } from "./delete-product-dialog";

interface AdminProductCardProps {
  product: AdminProduct;
}

function AdminProductCard({ product }: AdminProductCardProps) {
  const {
    optimisticIsActive,
    handleToggle,
    isTogglePending,
    handleDelete,
    isDeletePending,
  } = useAdminProductActions(product);

  return (
    <div
      data-slot="admin-product-card"
      className="bg-surface flex flex-col gap-3 rounded-xl border border-neutral-700 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="text-body-sm text-foreground hover:text-primary truncate font-medium"
          >
            {product.name}
          </Link>
          <span className="text-caption text-neutral-400">
            {product.category?.name ?? "Uncategorized"}
          </span>
          <span className="text-body-sm font-mono">
            {formatPrice(product.price)}
          </span>
        </div>

        <Switch
          checked={optimisticIsActive}
          onCheckedChange={handleToggle}
          disabled={isTogglePending}
          aria-label={`${optimisticIsActive ? "Deactivate" : "Activate"} ${product.name}`}
          className="mt-0.5 shrink-0"
        />
      </div>

      <div className="flex gap-2 border-t border-neutral-800 pt-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          nativeButton={false}
          render={<Link href={`/admin/products/${product.id}/edit`} />}
        >
          Edit
        </Button>
        <DeleteProductDialog
          productName={product.name}
          isPending={isDeletePending}
          onConfirm={handleDelete}
          trigger={
            <Button variant="outline" size="sm" className="flex-1">
              Delete
            </Button>
          }
        />
      </div>
    </div>
  );
}

export { AdminProductCard };
