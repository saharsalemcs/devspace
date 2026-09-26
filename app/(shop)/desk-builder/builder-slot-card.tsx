"use client";

import { CheckIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import pluralize from "pluralize";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { cn, formatPrice } from "@/lib/utils";
import { useDeskBuilderStore } from "@/stores/desk-builder-store";
import { SlotPickerModal } from "./slot-picker-modal";
import type { CategoryRow } from "@/types/models";

interface BuilderSlotCardProps {
  category: CategoryRow;
}

function BuilderSlotCard({ category }: BuilderSlotCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const selection = useDeskBuilderStore((state) =>
    state.selections.find((item) => item.categoryId === category.id),
  );
  const removeSlot = useDeskBuilderStore((state) => state.removeSlot);
  const Icon = CATEGORY_ICONS[category.icon_name ?? ""] ?? CATEGORY_ICONS.box;
  const singularName = pluralize.singular(category.name.toLowerCase());

  return (
    <>
      <div
        data-slot="builder-slot-card"
        className={cn(
          "bg-surface flex flex-col gap-3 rounded-xl border p-4",
          selection ? "border-ember-500 border-2" : "border-neutral-700",
        )}
      >
        <p className="text-caption text-neutral-400 uppercase">
          {category.name}
        </p>

        {selection ? (
          <div className="flex items-center gap-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
              <Image
                src={selection.imageUrl}
                alt={selection.name}
                fill
                sizes="56px"
                className="object-cover"
              />
              <span className="bg-accent absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-white">
                <CheckIcon className="size-2.5" />
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-body-sm text-foreground truncate">
                {selection.name}
              </p>
              <p className="text-accent mt-0.5">
                {formatPrice(selection.price)}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPickerOpen(true)}
              >
                Change
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeSlot(category.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="hover:text-foreground flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-700 py-6 text-neutral-400 transition-colors hover:border-neutral-600"
                />
              }
            >
              <Icon className="size-6" />
              <span className="text-body-sm">Choose a {singularName}</span>
            </TooltipTrigger>
            <TooltipContent>
              Select a {singularName} for your build
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <SlotPickerModal
        category={category}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
      />
    </>
  );
}

export { BuilderSlotCard };
