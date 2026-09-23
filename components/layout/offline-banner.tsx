"use client";
import { WifiOff } from "lucide-react";
import { useOffline } from "next/offline";

export function OfflineBanner() {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-background text-destructive-foreground fixed top-0 right-0 left-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden="true" />
      <span>
        You&apos;re offline. Some features may not work until your connection is
        back.
      </span>
    </div>
  );
}
