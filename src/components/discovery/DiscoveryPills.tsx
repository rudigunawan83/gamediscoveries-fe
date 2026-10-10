import Link from "next/link";
import { useTranslations } from "next-intl";
import type { NavLabelKey } from "@/components/navigation/nav-config";
import { cn } from "@/lib/utils";

const pills = [
  { href: "/hot-games", label: "hotGames", hot: true },
  { href: "/most-popular", label: "mostPopular" },
  { href: "/best-games", label: "bestGames" },
  { href: "/most-played", label: "mostPlayed" },
  { href: "/exclusive-games", label: "exclusive" },
  { href: "/new", label: "new" },
  { href: "/multiplayer", label: "multiplayer" },
  { href: "/games/puzzle", label: "puzzle" },
  { href: "/collections", label: "collections" },
] as const satisfies readonly { href: string; label: NavLabelKey; hot?: boolean }[];

export function DiscoveryPills() {
  const t = useTranslations("Nav");
  return (
    <ul className="flex w-full gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {pills.map((pill) => {
        const hot = "hot" in pill && pill.hot;

        return (
          <li key={pill.href + pill.label} className="shrink-0">
            <Link
              href={pill.href}
              className={cn(
                "relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                hot
                  ? "border-primary/40 bg-[#1a1408]/80 text-white"
                  : "border-primary/20 bg-[#12161f]/85 text-slate-100 hover:border-primary/45 hover:bg-primary/10",
              )}
            >
              {hot ? (
                <span
                  className="size-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgb(249_115_22_/_85%)]"
                  aria-hidden="true"
                />
              ) : null}
              {t(pill.label)}
              {hot ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 -bottom-[3px] h-[2px] rounded-full bg-brand-gradient"
                />
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
