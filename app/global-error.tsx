"use client";

import { useEffect } from "react";
import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";

export default function GlobalLayoutError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  useEffect(() => {
    console.error("Root layout error:", error);
  }, [error]);

  const handleRetry = () => {
    if (typeof retry === "function") {
      retry();
    } else if (typeof reset === "function") {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        <title>Application Error · DevSpace</title>
      </head>
      <body className="flex min-h-full flex-col items-center justify-center bg-[#0a0a0b] px-4 py-16 text-[#f5f5f7] font-sans selection:bg-[#ff5a1f] selection:text-white">
        <div className="flex max-w-md flex-col items-center text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-[#26262b] bg-[#151518] shadow-inner">
            <AlertCircleIcon className="size-8 text-[#ff5a1f]" aria-hidden="true" />
          </div>

          <span className="mb-2 text-xs font-mono uppercase tracking-widest text-[#ff5a1f]">
            Fatal Error
          </span>

          <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f7] sm:text-3xl">
            Critical system error
          </h1>

          <p className="mt-3 text-sm text-[#9a9aa2] leading-relaxed">
            The application encountered an unexpected error while initializing.
            Please try reloading the page.
          </p>

          {error.digest && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-[#26262b] bg-[#151518] px-2.5 py-1 text-xs font-mono text-[#6d6d75]">
              <span>Error ID:</span>
              <span className="text-[#9a9aa2] select-all">{error.digest}</span>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleRetry}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#ff5a1f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff7d45] active:bg-[#e64509]"
            >
              <RefreshCwIcon className="size-4" />
              Try again
            </button>
            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#26262b] bg-[#151518] px-4 py-2 text-sm font-medium text-[#f5f5f7] transition-colors hover:bg-[#1a1a1f] hover:text-white"
            >
              Reload application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
