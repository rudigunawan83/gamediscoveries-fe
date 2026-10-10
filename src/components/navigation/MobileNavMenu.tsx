"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Gamepad2,
  Home,
  LogIn,
  LogOut,
  Menu,
  Search,
  Sparkles,
  Smartphone,
  TrendingUp,
  Users,
} from "lucide-react";
import { desktopNavItems, type NavLabelKey } from "@/components/navigation/nav-config";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navIcons: Record<string, typeof Home> = {
  "/": Home,
  "/community": Users,
  "/games": Gamepad2,
  "/trending": TrendingUp,
  "/new": Sparkles,
  "/mobile": Smartphone,
  "/multiplayer": Users,
  "/hot-games": TrendingUp,
  "/best-games": Sparkles,
  "/most-played": Gamepad2,
  "/exclusive-games": Sparkles,
};

const extraItems = [
  { href: "/search", label: "search", icon: Search },
  { href: "/progress", label: "progress", icon: Sparkles },
  { href: "/my-games", label: "myGames", icon: Gamepad2 },
  { href: "/download", label: "downloadApp", icon: Smartphone },
] as const satisfies readonly { href: string; label: NavLabelKey; icon: typeof Home }[];

export function MobileNavMenu() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const t = useTranslations("Nav");
  const tCommon = useTranslations("Common");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("openMenu")}
            className="size-10 shrink-0 text-foreground"
          />
        }
      >
        <Menu className="size-6" strokeWidth={2.25} aria-hidden="true" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[min(100%,20rem)] border-primary/20 bg-[#0a0c12]/96 p-0 backdrop-blur-xl"
        showCloseButton
      >
        <SheetHeader className="border-b border-white/10 px-5 py-5">
          <SheetTitle className="font-display text-lg font-bold tracking-tight">
            <span className="text-foreground">Game</span>
            <span className="text-brand-gradient">Discoveries</span>
          </SheetTitle>
          <SheetDescription className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t("menuTagline")}
          </SheetDescription>
        </SheetHeader>

        <nav aria-label={t("menuLabel")} className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {desktopNavItems.map((item) => {
              const Icon = navIcons[item.href] ?? Home;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <SheetClose
                    render={
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/15 text-white"
                            : "text-muted-foreground hover:bg-white/5 hover:text-white",
                        )}
                      />
                    }
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span>{t(item.label)}</span>
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="ml-auto size-1.5 rounded-full bg-brand-gradient"
                      />
                    ) : null}
                  </SheetClose>
                </li>
              );
            })}
          </ul>

          <div className="my-4 h-px bg-white/10" />

          <ul className="space-y-1">
            {extraItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <SheetClose
                    render={
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/15 text-white"
                            : "text-muted-foreground hover:bg-white/5 hover:text-white",
                        )}
                      />
                    }
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span>{t(item.label)}</span>
                  </SheetClose>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto border-t border-white/10 p-4">
          {isAuthenticated ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-start gap-3 rounded-xl border-white/10 bg-transparent"
              onClick={() => {
                setOpen(false);
                void logout();
              }}
            >
              <LogOut className="size-4" aria-hidden="true" />
              {tCommon("signOut")}
            </Button>
          ) : (
            <SheetClose
              render={
                <Link
                  href="/login"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient text-sm font-semibold text-white shadow-[0_8px_24px_rgb(168_85_247_/_35%)]"
                />
              }
            >
              <LogIn className="size-4" aria-hidden="true" />
              {tCommon("signIn")}
            </SheetClose>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
