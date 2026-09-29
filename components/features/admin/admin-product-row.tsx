"use client";

import Image from "next/image";
import Link from "next/link";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAdminProductActions } from "@/hooks/admin/use-admin-product-actions";
import { formatPrice } from "@/lib/utils";
import type { AdminProduct } from "@/lib/queries/admin-products";
import { DeleteProductDialog } from "./delete-product-dialog";

interface AdminProductRowProps {
  product: AdminProduct;
}

function AdminProductRow({ product }: AdminProductRowProps) {
  const {
    optimisticIsActive,
    handleToggle,
    isTogglePending,
    handleDelete,
    isDeletePending,
  } = useAdminProductActions(product);

  return (
    <tr className="border-b border-neutral-800 last:border-b-0">
      <td className="flex items-center gap-3 py-3 pr-4">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-neutral-800">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="text-body-sm text-foreground hover:text-primary truncate"
        >
          {product.name}
        </Link>
      </td>
      <td className="text-body-sm py-3 pr-4 text-neutral-400">
        {product.category?.name ?? "Uncategorized"}
      </td>
      <td className="text-body-sm py-3 pr-4 font-mono">
        {formatPrice(product.price)}
      </td>
      <td className="py-3 pr-4">
        <Switch
          checked={optimisticIsActive}
          onCheckedChange={handleToggle}
          disabled={isTogglePending}
          aria-label={`${optimisticIsActive ? "Deactivate" : "Activate"} ${product.name}`}
        />
      </td>
      <td className="py-3 text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/admin/products/${product.id}/edit`} />}
          >
            Edit
          </Button>
          <DeleteProductDialog
            productName={product.name}
            isPending={isDeletePending}
            onConfirm={handleDelete}
            trigger={
              <Button variant="outline" size="sm">
                Delete
              </Button>
            }
          />
        </div>
      </td>
    </tr>
  );
}

export { AdminProductRow };
