import Link from "next/link";
import { cn } from "@/lib/utils";

const pills = [
  { href: "/trending", label: "Trending", hot: true },
  { href: "/new", label: "New" },
  { href: "/mobile", label: "Mobile" },
  { href: "/multiplayer", label: "Multiplayer" },
  { href: "/games?tag=2-player", label: "2 Player" },
  { href: "/games?category=Puzzle", label: "Puzzle" },
  { href: "/games?category=Racing", label: "Racing" },
  { href: "/games?category=Action", label: "Action" },
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
                  ? "border-sky-400/20 bg-[#12192d]/70 text-white"
                  : "border-sky-400/25 bg-[#0e1528]/80 text-slate-100 hover:border-violet-400/40 hover:bg-violet-500/10",
              )}
            >
              {hot ? (
                <span
                  className="size-2 rounded-full bg-red-500 shadow-[0_0_10px_rgb(239_68_68_/_85%)]"
                  aria-hidden="true"
                />
              ) : null}
              {pill.label}
              {hot ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 -bottom-[3px] h-[2px] rounded-full bg-red-500"
                />
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
