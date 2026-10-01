import { OfflineAwareLoading } from "@/components/layout/offline-loading";
import { Skeleton } from "@/components/ui/skeleton";

export default function GlobalLoading() {
  return (
    <OfflineAwareLoading message="Waiting for connection to load this page…">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
        <Skeleton className="h-9 w-56 rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-4/5 rounded-md" />
          <Skeleton className="h-5 w-3/5 rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </OfflineAwareLoading>
  );
}
