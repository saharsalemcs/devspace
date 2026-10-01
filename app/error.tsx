"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCwIcon, HomeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/layout/error-state";

export default function GlobalError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
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
    <ErrorState
      eyebrow="Application Error"
      title="Something went wrong"
      description="An unexpected error occurred while loading this page. You can try reloading the section or returning home."
      digest={error.digest}
      actions={
        <>
          <Button onClick={handleRetry} className="gap-2">
            <RefreshCwIcon className="size-4" />
            Try again
          </Button>
          <Button
            variant="outline"
            render={<Link href="/" />}
            nativeButton={false}
            className="gap-2"
          >
            <HomeIcon className="size-4" />
            Go to Home
          </Button>
        </>
      }
    />
  );
}
