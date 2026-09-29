"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  StarIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/products", label: "Products", icon: PackageIcon },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCartIcon },
  { href: "/admin/reviews", label: "Reviews", icon: StarIcon },
];

function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="bg-surface flex w-56 shrink-0 flex-col gap-1 border-r border-neutral-700 p-4">
      <span className="text-caption mb-2 px-2 text-neutral-500 uppercase">
        Admin
      </span>

      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/admin" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "text-body-sm flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors",
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
    </nav>
  );
}

export { AdminSidebar };
