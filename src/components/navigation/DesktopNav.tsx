"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { desktopNavItems } from "@/components/navigation/nav-config";
import { cn } from "@/lib/utils";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      {desktopNavItems.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "text-white"
                : "text-muted-foreground hover:text-white",
            )}
          >
            {item.label}
            {active ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-gradient"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
