import type { ReactNode } from "react";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <Logo markClassName="size-8" />
        </Link>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
