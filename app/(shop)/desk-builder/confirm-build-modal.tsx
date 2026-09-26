"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { BundleTotal } from "@/lib/queries/bundle";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import {
  useDeskBuilderStore,
  type BuilderSelection,
} from "@/stores/desk-builder-store";

interface ConfirmBuildModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selections: BuilderSelection[];
  totals: Pick<BundleTotal, "subtotal" | "discount" | "total">;
}

function ConfirmBuildModal({
  open,
  onOpenChange,
  selections,
  totals,
}: ConfirmBuildModalProps) {
  const router = useRouter();
  const addBundle = useCartStore((state) => state.addBundle);
  const resetBuilder = useDeskBuilderStore((state) => state.reset);

  function handleConfirm() {
    const bundleId = crypto.randomUUID();

    addBundle(
      selections.map((selection) => ({
        id: selection.productId,
        name: selection.name,
        slug: selection.slug,
        price: selection.price,
        imageUrl: selection.imageUrl,
      })),
      bundleId,
    );

    resetBuilder();
    onOpenChange(false);
    toast.success("Your build was added to cart");
    router.push("/cart");
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Confirm Your Build</ModalTitle>
        </ModalHeader>

        <ModalBody className="flex flex-col gap-4">
          <ul className="flex flex-col gap-3">
            {selections.map((selection) => (
              <li
                key={selection.categoryId}
                className="flex items-center gap-3"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                  <Image
                    src={selection.imageUrl}
                    alt={selection.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-body text-foreground truncate">
                    {selection.name}
                  </p>
                  <p className="text-caption text-neutral-400 uppercase">
                    {selection.categoryName}
                  </p>
                </div>
                <p className="text-foreground text-lg">
                  {formatPrice(selection.price)}
                </p>
              </li>
            ))}
          </ul>

          <Separator />

          <div className="flex flex-col gap-2">
            <div className="text-body flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>

            {totals.discount > 0 && (
              <div className="text-body text-accent flex justify-between">
                <span>Bundle Discount (5%)</span>
                <span className="font-mono">
                  -{formatPrice(totals.discount)}
                </span>
              </div>
            )}
          </div>

          <Separator />

          <div className="text-h4 text-foreground flex justify-between">
            <span>Total</span>
            <span className="text-price text-accent font-mono">
              {formatPrice(totals.total)}
            </span>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Editing
          </Button>
          <Button onClick={handleConfirm}>Add to Cart</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export { ConfirmBuildModal };
