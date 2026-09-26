"use client";

import { XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCalculateBundle } from "@/hooks/use-calculate-bundle";
import { formatPrice } from "@/lib/utils";
import { useDeskBuilderStore } from "@/stores/desk-builder-store";
import { ConfirmBuildModal } from "./confirm-build-modal";

function LiveSummaryPanel() {
  const selections = useDeskBuilderStore((state) => state.selections);
  const removeSlot = useDeskBuilderStore((state) => state.removeSlot);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const productIds = selections.map((selection) => selection.productId);
  const hasSelections = productIds.length > 0;
  const { data: bundleTotal } = useCalculateBundle(productIds);

  const subtotal = hasSelections ? (bundleTotal?.subtotal ?? 0) : 0;
  const discount = hasSelections ? (bundleTotal?.discount ?? 0) : 0;
  const total = hasSelections ? (bundleTotal?.total ?? 0) : 0;

  return (
    <div
      data-slot="live-summary-panel"
      className="bg-surface sticky top-24 flex h-fit flex-col gap-4 rounded-xl border border-neutral-700 p-6"
    >
      <h2 className="text-h4 text-foreground font-semibold">Your Build</h2>

      {selections.length === 0 ? (
        <p className="text-body text-neutral-400">
          Choose components from the slots to see your build here.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {selections.map((selection) => (
            <li key={selection.categoryId} className="flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-neutral-800">
                <Image
                  src={selection.imageUrl}
                  alt={selection.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-body-sm text-foreground truncate">
                  {selection.name}
                </p>
                <p className="text-caption text-neutral-400">
                  {formatPrice(selection.price)}
                </p>
              </div>
              <IconButton
                aria-label={`Remove ${selection.name}`}
                size="icon-sm"
                onClick={() => removeSlot(selection.categoryId)}
              >
                <XIcon />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      <Separator />

      <div className="flex flex-col gap-2">
        <div className="text-body flex justify-between text-neutral-300">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="text-accent flex cursor-help justify-between" />
              }
            >
              <span>Bundle Discount (5%)</span>
              <span>-{formatPrice(discount)}</span>
            </TooltipTrigger>
            <TooltipContent>
              5% discount applies when you add 3+ components
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <Separator />

      <div className="text-h4 text-foreground flex justify-between">
        <span>Total</span>
        <span className="text-accent">{formatPrice(total)}</span>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!hasSelections}
        onClick={() => setConfirmOpen(true)}
      >
        Add Bundle to Cart
      </Button>

      <ConfirmBuildModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        selections={selections}
        totals={{ subtotal, discount, total }}
      />
    </div>
  );
}

export { LiveSummaryPanel };
