"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useBuilderSlots } from "@/hooks/use-builder-slots";
import { BuilderSlotCard } from "./builder-slot-card";
import { LiveSummaryPanel } from "./live-summary-panel";

function DeskBuilderView() {
  const { data: slots, isPending, isError } = useBuilderSlots();

  return (
    <div
      data-slot="desk-builder-view"
      className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_360px]"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isPending &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}

        {isError && (
          <p className="text-danger-500 sm:col-span-2">
            Couldn&apos;t load Desk Builder slots. Try refreshing the page.
          </p>
        )}

        {!isPending &&
          !isError &&
          slots?.map((category) => (
            <BuilderSlotCard key={category.id} category={category} />
          ))}
      </div>

      <LiveSummaryPanel />
    </div>
  );
}

export { DeskBuilderView };
