import { Skeleton } from "@/components/ui/skeleton";

function CartViewSkeleton() {
  return (
    <div
      data-slot="cart-view-skeleton"
      className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_360px]"
    >
      <div className="bg-surface flex flex-col gap-4 rounded-xl border border-neutral-700 p-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <Skeleton className="size-20 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export { CartViewSkeleton };
