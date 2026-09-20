import Link from "next/link";
import { SearchIcon, ShoppingCartIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";

function Navbar() {
  return (
    <header
      data-slot="navbar"
      className="bg-background/80 sticky top-0 z-30 border-b border-neutral-700 backdrop-blur-sm"
    >
      <Container className="flex h-16 items-center gap-4">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-90">
          <Logo />
        </Link>

        <div className="relative hidden max-w-md flex-1 sm:block">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search products…"
            disabled
            className="pl-8"
            aria-label="Search products"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <IconButton
            aria-label="View cart"
            render={<Link href="/cart" />}
            nativeButton={false}
          >
            <ShoppingCartIcon />
          </IconButton>

          <Button
            variant="secondary"
            size="sm"
            render={<Link href="/login" />}
            nativeButton={false}
          >
            Sign In
          </Button>
        </div>
      </Container>
    </header>
  );
}

export { Navbar };
