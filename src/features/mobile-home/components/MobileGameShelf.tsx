import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/types/game";

/** Horizontal shelf matching the app's GameShelf: 148px cards with 4:3 art. */
export function MobileGameShelf({
  title,
  games,
  href,
}: {
  title: string;
  games: Game[];
  href?: string;
}) {
  if (games.length === 0) return null;

  return (
    <section aria-label={title} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-white">{title}</h2>
        {href ? (
          <Link href={href} className="py-1.5 text-[13px] font-bold text-primary">
            See All
          </Link>
        ) : null}
      </div>
      <ul className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((game) => (
          <li key={game.id} className="w-[148px] shrink-0 snap-start">
            <MobileGameCard game={game} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function MobileGameCard({ game }: { game: Game }) {
  const category = game.categories[0]?.name;

  return (
    <Link href={`/game/${game.slug}`} className="block rounded-[18px]">
      <span className="relative block aspect-[4/3] overflow-hidden rounded-[18px] bg-[#1e1e29]">
        {game.thumbnailUrl ? (
          <Image
            src={game.thumbnailUrl}
            alt=""
            fill
            sizes="148px"
            className="object-cover"
          />
        ) : null}
      </span>
      <span className="mt-2 block truncate text-sm font-bold text-white">
        {game.title}
      </span>
      {category ? (
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {category}
        </span>
      ) : null}
    </Link>
  );
}

export function MobileGameShelfSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="h-5 w-36 rounded-lg bg-[#1e1e29]" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="w-[148px] shrink-0">
            <div className="aspect-[4/3] rounded-[18px] bg-[#1e1e29]" />
            <div className="mt-2 h-3.5 w-[110px] rounded-lg bg-[#1e1e29]" />
            <div className="mt-1.5 h-3 w-[70px] rounded-lg bg-[#1e1e29]" />
          </div>
        ))}
      </div>
    </div>
  );
}
