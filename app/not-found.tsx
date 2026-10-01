import Link from "next/link";
import { CompassIcon, HomeIcon, LayersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/layout/error-state";

export default function NotFound() {
  return (
    <ErrorState
      eyebrow="404 — Not Found"
      title="Page not found"
      description="The page you're looking for doesn't exist, was removed, or the link may be broken."
      actions={
        <>
          <Button
            render={<Link href="/products" />}
            nativeButton={false}
            className="gap-2"
          >
            <CompassIcon className="size-4" />
            Browse Products
          </Button>
          <Button
            variant="secondary"
            render={<Link href="/desk-builder" />}
            nativeButton={false}
            className="gap-2"
          >
            <LayersIcon className="size-4" />
            Desk Builder
          </Button>
          <Button
            variant="outline"
            render={<Link href="/" />}
            nativeButton={false}
            className="gap-2"
          >
            <HomeIcon className="size-4" />
            Home
          </Button>
        </>
      }
    />
  );
}
