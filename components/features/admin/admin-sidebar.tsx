"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  LayoutDashboardIcon,
  MenuIcon,
  PackageIcon,
  ShoppingCartIcon,
  StarIcon,
  XIcon,
} from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/products", label: "Products", icon: PackageIcon },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCartIcon },
  { href: "/admin/reviews", label: "Reviews", icon: StarIcon },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/admin" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "text-body mb-1 flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "hover:text-foreground text-neutral-400 hover:bg-neutral-800",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </>
  );
}

function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-surface flex items-center justify-between border-b border-neutral-700 p-3 md:hidden">
        <span className="text-caption text-neutral-500 uppercase">Admin</span>
        <IconButton
          aria-label="Open menu"
          size="icon-sm"
          onClick={() => setOpen(true)}
        >
          <MenuIcon />
        </IconButton>
      </div>

      <nav className="bg-surface hidden w-56 shrink-0 flex-col gap-1 border-r border-neutral-700 p-4 md:flex">
        <span className="text-body-sm mb-3 px-2 text-neutral-500 uppercase">
          Admin
        </span>
        <NavLinks pathname={pathname} />
      </nav>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop
            className={cn(
              "fixed inset-0 z-40 bg-neutral-950/70 duration-200 md:hidden",
              "data-open:animate-in data-open:fade-in-0",
              "data-closed:animate-out data-closed:fade-out-0",
            )}
          />
          <DialogPrimitive.Popup
            className={cn(
              "bg-surface fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-1 border-r border-neutral-700 p-4 shadow-2xl duration-200 outline-none md:hidden",
              "data-open:animate-in data-open:slide-in-from-left",
              "data-closed:animate-out data-closed:slide-out-to-left",
            )}
          >
            <DialogPrimitive.Title className="sr-only">
              Admin navigation
            </DialogPrimitive.Title>

            <div className="mb-3 flex items-center justify-between px-2">
              <span className="text-body-sm text-neutral-500 uppercase">
                Admin
              </span>
              <DialogPrimitive.Close
                render={<IconButton aria-label="Close menu" size="icon-sm" />}
              >
                <XIcon />
              </DialogPrimitive.Close>
            </div>

            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}

export { AdminSidebar };
