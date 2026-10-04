import Link from "next/link";
import { cn } from "@/lib/utils";

const pills = [
  { href: "/hot-games", label: "Hot Games", hot: true },
  { href: "/most-popular", label: "Most Popular" },
  { href: "/best-games", label: "Best Games" },
  { href: "/most-played", label: "Most Played" },
  { href: "/exclusive-games", label: "Exclusive" },
  { href: "/new", label: "New" },
  { href: "/multiplayer", label: "Multiplayer" },
  { href: "/games?category=Puzzle", label: "Puzzle" },
] as const;

export function DiscoveryPills() {
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
              {pill.label}
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
