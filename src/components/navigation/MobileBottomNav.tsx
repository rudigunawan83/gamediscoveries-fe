"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flag, Gamepad2, Home, Search, User } from "lucide-react";
import { isMobileFullScreenPath, mobileBottomNavItems } from "@/components/navigation/nav-config";
import { cn } from "@/lib/utils";

const icons = {
  home: Home,
  search: Search,
  gamepad: Gamepad2,
  flag: Flag,
  user: User,
} as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  if (isMobileFullScreenPath(pathname)) return null;

  return (
    <nav
      aria-label="Mobile"
      data-mobile-bottom-nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#2a2a37] bg-[#0b0b10]/95 backdrop-blur-xl lg:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 px-1 py-1.5">
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
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-semibold transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-14 place-items-center rounded-full transition-colors",
                    active && "bg-primary/15",
                  )}
                >
                  <Icon
                    className={cn("size-5", active && "fill-primary/20")}
                    aria-hidden="true"
                  />
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
