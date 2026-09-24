"use client";

import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { withProductParams } from "@/lib/products-url";

function NavbarSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(
    pathname === "/products" ? (searchParams.get("q") ?? "") : "",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const base =
      pathname === "/products" ? searchParams : new URLSearchParams();
    router.push(
      `/products${withProductParams(base, { q: value || undefined })}`,
    );
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="relative hidden max-w-md flex-1 sm:block"
    >
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-neutral-400" />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products…"
        className="pl-8"
        aria-label="Search products"
      />
    </form>
  );
}

export { NavbarSearch };
