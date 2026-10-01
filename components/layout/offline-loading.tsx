"use client";

import type { ReactNode } from "react";
import { WifiOffIcon } from "lucide-react";
import { useOffline } from "next/offline";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

interface OfflineAwareLoadingProps {
  children: ReactNode;
  message?: string;
  className?: string;
  contained?: boolean;
}

export function OfflineAwareLoading({
  children,
  message = "Waiting for connection to load this page…",
  className,
  contained = true,
}: OfflineAwareLoadingProps) {
  const isOffline = useOffline();

  if (!isOffline) {
    return <>{children}</>;
  }

  const fallback = (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-center py-20 px-4 sm:py-28 animate-fade-in",
        className,
      )}
    >
      <div className="relative mb-6 flex size-16 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-900/90 shadow-inner">
        <WifiOffIcon className="size-8 text-accent animate-pulse" aria-hidden="true" />
        <span className="absolute -top-1 -right-1 flex size-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex size-3 rounded-full bg-accent" />
        </span>
      </div>

      <span className="mb-2 text-caption font-mono uppercase tracking-widest text-accent">
        Offline Mode
      </span>

      <h2 className="text-h3 font-bold tracking-tight text-foreground max-w-md">
        {message}
      </h2>

      <p className="mt-2 max-w-sm text-body-sm text-neutral-400">
        Your device is currently offline. DevSpace will automatically resume loading once your internet connection is restored.
      </p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-1.5 text-caption text-neutral-400">
        <span className="size-2 rounded-full bg-accent animate-pulse" />
        Listening for network connection…
      </div>
    </div>
  );

  if (contained) {
    return <Container>{fallback}</Container>;
  }

  return fallback;
}
