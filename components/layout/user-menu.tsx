"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { LogOutIcon, PackageIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { signOut } from "@/lib/supabase/auth-actions";

interface UserMenuProps {
  fullName: string | null;
  email?: string;
}

const menuItemClass =
  "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0";

function UserMenu({ fullName, email }: UserMenuProps) {
  const [pending, startTransition] = useTransition();
  const label = fullName?.trim() || email || "Account";
  const initial = label.slice(0, 1).toUpperCase();

  function handleSignOut() {
    startTransition(async () => {
      const result = await signOut();
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      window.location.href = "/";
    });
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        data-slot="user-menu-trigger"
        className="text-foreground hover:bg-muted focus-visible:ring-ring/50 flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm font-medium transition-colors outline-none focus-visible:ring-3"
      >
        <span className="bg-accent flex size-6 items-center justify-center rounded-full text-xs font-semibold text-white">
          {initial}
        </span>
        <span className="hidden max-w-28 truncate sm:inline">{label}</span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          className="isolate z-50"
        >
          <Menu.Popup className="bg-popover text-popover-foreground ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 min-w-44 rounded-lg p-1 shadow-md ring-1">
            <Menu.Item
              render={<Link href="/account" />}
              className={menuItemClass}
            >
              <UserIcon />
              My Account
            </Menu.Item>
            <Menu.Item
              render={<Link href="/account/orders" />}
              className={menuItemClass}
            >
              <PackageIcon />
              Orders
            </Menu.Item>
            <div className="bg-border my-1 h-px" />
            <Menu.Item
              onClick={handleSignOut}
              disabled={pending}
              className={cn(
                menuItemClass,
                "text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive",
              )}
            >
              <LogOutIcon />
              {pending ? "Signing out…" : "Log out"}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export { UserMenu };
