import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Game } from "@/types/game";

const MAX_FEATURED = 8;

/** Swipeable featured cards like the app's FeaturedCarousel (88% wide, 200px tall). */
export function MobileFeaturedCarousel({ games }: { games: Game[] }) {
  const t = useTranslations("Discovery");
  const items = games.slice(0, MAX_FEATURED);
  if (items.length === 0) return null;

  return (
    <ul
      aria-label={t("featuredGames")}
      className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((game) => {
        const category = game.categories[0]?.name;
        return (
          <li key={game.id} className="w-[88%] shrink-0 snap-start">
            <Link
              href={`/game/${game.slug}`}
              aria-label={t("featuredLabel", { title: game.title })}
              className="relative block h-[200px] overflow-hidden rounded-3xl bg-[#15151d]"
            >
              {game.coverUrl || game.thumbnailUrl ? (
                <Image
                  src={game.coverUrl || game.thumbnailUrl}
                  alt=""
                  fill
                  sizes="88vw"
                  className="object-cover"
                />
              ) : null}
              <span className="absolute inset-0 bg-gradient-to-b from-transparent from-35% to-[#090910e6]" />
              <span className="absolute inset-x-4 bottom-4 block">
                <span className="inline-block rounded-full bg-gradient-to-r from-[#ffc83d] to-[#f5a524] px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-[#1a1205]">
                  {t("featuredBadge")}
                </span>
                <span className="mt-2 block truncate text-xl font-extrabold text-white">
                  {game.title}
                </span>
                {category ? (
                  <span className="block text-xs text-white/70">{category}</span>
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
