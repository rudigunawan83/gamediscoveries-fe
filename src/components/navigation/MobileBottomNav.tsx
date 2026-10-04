"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Home, Search, Users } from "lucide-react";
import { mobileBottomNavItems } from "@/components/navigation/nav-config";
import { cn } from "@/lib/utils";

const icons = {
  home: Home,
  users: Users,
  search: Search,
  gamepad: Gamepad2,
} as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile"
      data-mobile-bottom-nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/15 bg-[#0a0c12]/95 backdrop-blur-xl lg:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 px-2 py-2">
        {mobileBottomNavItems.map((item) => {
          const Icon = icons[item.icon];
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
