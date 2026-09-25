import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { Suspense } from "react";

import { CartLink } from "@/components/layout/cart-link";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { NavbarSearch } from "@/components/layout/navbar-search";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { getProfile, getSession } from "@/lib/supabase/auth";

async function Navbar() {
  const [session, profile] = await Promise.all([getSession(), getProfile()]);

  return (
    <header
      data-slot="navbar"
      className="bg-background/80 sticky top-0 z-30 border-b border-neutral-700 backdrop-blur-sm"
    >
      <Container className="flex h-16 items-center gap-4">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-90">
          <Logo />
        </Link>

        <Suspense fallback={<NavbarSearchFallback />}>
          <NavbarSearch />
        </Suspense>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <CartLink />

          {session ? (
            <UserMenu
              fullName={profile?.full_name ?? null}
              email={session.email}
            />
          ) : (
            <Button
              variant="secondary"
              size="lg"
              render={<Link href="/login" />}
              nativeButton={false}
            >
              Sign In
            </Button>
          )}
        </div>
      </Container>
    </header>
  );
}

function NavbarSearchFallback() {
  return (
    <div className="relative hidden max-w-md flex-1 sm:block">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-neutral-400" />
      <div className="border-input h-8 w-full rounded-lg border bg-transparent" />
    </div>
  );
}

export { Navbar };
