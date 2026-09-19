import Link from "next/link"
import { SearchIcon, ShoppingCartIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"

// Layout shell only — Phase 4.2 wires up real search, Phase 5.2 adds the
// cart item-count badge, and Phase 3.5 swaps "Sign In" for the user menu.
function Navbar() {
  return (
    <header
      data-slot="navbar"
      className="sticky top-0 z-30 border-b border-neutral-700 bg-background/80 backdrop-blur-sm"
    >
      <Container className="flex h-16 items-center gap-4">
        <Link
          href="/"
          className="shrink-0 text-h4 font-bold text-foreground"
        >
          Dev<span className="text-accent">Space</span>
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
  )
}

export { Navbar }
