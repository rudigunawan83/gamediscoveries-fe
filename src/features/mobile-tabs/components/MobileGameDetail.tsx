"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePlayGameClick } from "@/features/games/components/GameDetailPlayCta";
import { MobileGameShelf } from "@/features/mobile-home/components/MobileGameShelf";
import { FavoriteButton } from "@/features/my-games/components/FavoriteButton";
import { useSimilarGames } from "@/features/recommendations/hooks/useRecommendations";
import { ShareButton } from "@/features/seo/components/ShareButton";
import { getGameReviews } from "@/lib/api/community";
import { cn } from "@/lib/utils";
import type { Game } from "@/types/game";
import { MobileGameListSkeleton, MobilePillTabs } from "./MobileTabUi";

const TABS = ["About", "How to Play", "Reviews", "Similar"] as const;
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export function formatTimeAgo(iso: string, now = Date.now()) {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";
  const minutes = Math.floor((now - time) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(time).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Mirrors the app's game detail screen. */
export function MobileGameDetail({
  game,
  playable,
  shareUrl,
  fallbackSimilar,
}: {
  game: Game;
  playable: boolean;
  shareUrl: string;
  fallbackSimilar: Game[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const onPlayClick = usePlayGameClick({
    gameId: game.id,
    gameSlug: game.slug,
    orientation: game.orientation,
  });

  const reviews = useQuery({
    queryKey: ["community", "reviews", game.slug],
    queryFn: async () => (await getGameReviews(game.slug)).data,
  });
  const similarQuery = useSimilarGames(game.id, 12);
  const similar = similarQuery.data?.games.length ? similarQuery.data.games : fallbackSimilar;

  const category = game.categories[0]?.name;
  const orientation =
    game.orientation === "portrait" ? "Portrait" : game.orientation ? "Landscape" : null;
  const summary = reviews.data?.summary;
  const playHref = `/game/${game.slug}/play`;

  return (
    <div className="-mx-4 -mt-6">
      <div className="relative h-[280px] bg-[#15151d]">
        {game.coverUrl || game.thumbnailUrl ? (
          <Image
            src={game.coverUrl || game.thumbnailUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,11,16,0.6)_0%,transparent_40%,#0b0b10_100%)]" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-2 pt-2">
          <button
            type="button"
            aria-label="Back"
            onClick={() => {
              if (window.history.length > 1) router.back();
              else router.push("/");
            }}
            className="grid size-11 place-items-center rounded-full text-white"
          >
            <ArrowLeft className="size-6" aria-hidden="true" />
          </button>
          <ShareButton
            iconOnly
            title={`Play ${game.title} online`}
            text={`Play ${game.title} on GameDiscoveries`}
            url={shareUrl}
            entityType="game"
            entityId={game.id}
            className="size-11 rounded-full border-0 bg-transparent text-white hover:bg-white/10"
          />
        </div>
        {playable ? (
          <Link
            href={playHref}
            onClick={onPlayClick}
            aria-label={`Play ${game.title}`}
            className="absolute left-1/2 top-1/2 grid size-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[2.5px] border-[#ffc83d] bg-black/45"
          >
            <Play className="ml-1 size-9 fill-[#ffc83d] text-[#ffc83d]" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      <div className="space-y-3 px-5 pt-2">
        <h1 className="text-2xl font-black text-white">{game.title}</h1>
        <div className="flex flex-wrap gap-2">
          {category ? <Chip label={category} color="#ffc83d" /> : null}
          {game.mobileReady ? <Chip label="Mobile" color="#2bd576" /> : null}
          {orientation ? <Chip label={orientation} color="#3b82f6" /> : null}
          {game.tags.slice(0, 3).map((tag) => (
            <Chip key={tag} label={tag} color="#8b5cf6" />
          ))}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star className="size-5 fill-[#ffc83d] text-[#ffc83d]" aria-hidden="true" />
          <span className="font-extrabold text-white">
            {summary && summary.reviewCount > 0
              ? summary.averageRating.toFixed(1)
              : "No ratings yet"}
          </span>
          {summary && summary.reviewCount > 0 ? (
            <span className="text-xs text-[#9c9cb0]">
              ({compact.format(summary.reviewCount)} reviews)
            </span>
          ) : null}
          {game.developer ? (
            <span className="ml-2 truncate text-xs text-[#9c9cb0]">by {game.developer}</span>
          ) : null}
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          {playable ? (
            <Link
              href={playHref}
              onClick={onPlayClick}
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#ffc83d] text-base font-extrabold text-[#1a1205]"
            >
              <Play className="size-6 fill-current" aria-hidden="true" />
              Play Now
            </Link>
          ) : (
            <span className="flex h-[52px] flex-1 items-center justify-center rounded-2xl bg-[#1e1e29] text-base font-bold text-[#6b6b7e]">
              Not available
            </span>
          )}
          <span className="grid size-[52px] shrink-0 place-items-center rounded-2xl border border-[#2a2a37] bg-[#1e1e29]">
            <FavoriteButton
              gameId={game.id}
              source="game_detail"
              className="size-11 bg-transparent"
            />
          </span>
          <ShareButton
            iconOnly
            title={`Play ${game.title} online`}
            text={`Play ${game.title} on GameDiscoveries`}
            url={shareUrl}
            entityType="game"
            entityId={game.id}
            className="size-[52px] shrink-0 rounded-2xl border-[#2a2a37] bg-[#1e1e29] text-[#9c9cb0]"
          />
        </div>
      </div>

      <div className="mt-6 px-4">
        <MobilePillTabs
          label="Game details"
          expanded={false}
          labels={TABS}
          selectedIndex={tab}
          onChange={setTab}
        />
      </div>

      <div className="px-5 pt-[18px]">
        {tab === 0 ? (
          <TextSection text={game.description} empty="No description yet." />
        ) : tab === 1 ? (
          <TextSection
            text={game.instructions}
            empty="Just tap Play Now and follow the in-game tutorial."
          />
        ) : tab === 2 ? (
          reviews.isPending ? (
            <MobileGameListSkeleton count={3} />
          ) : reviews.isError ? (
            <TextSection text={null} empty="Reviews failed to load. Please try again later." />
          ) : !reviews.data?.items.length ? (
            <TextSection text={null} empty="No reviews yet. Be the first after you play!" />
          ) : (
            <ul className="space-y-3.5">
              {reviews.data.items.slice(0, 10).map((review) => (
                <li key={review.id}>
                  <ReviewTile review={review} />
                </li>
              ))}
            </ul>
          )
        ) : similar.length === 0 ? (
          <TextSection
            text={null}
            empty={similarQuery.isPending ? "Loading similar games…" : "No similar games found."}
          />
        ) : (
          <SimilarGrid games={similar} />
        )}
      </div>

      {tab !== 3 && similar.length > 0 ? (
        <div className="mt-7 px-4">
          <MobileGameShelf title="Similar Games" games={similar} />
        </div>
      ) : null}
    </div>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="rounded-full px-2.5 py-[5px] text-xs font-bold"
      style={{ color, backgroundColor: `${color}24` }}
    >
      {label}
    </span>
  );
}

function TextSection({ text, empty }: { text?: string | null; empty: string }) {
  const value = text?.trim() ?? "";
  return (
    <p className="whitespace-pre-line text-sm leading-[1.55] text-[#9c9cb0]">
      {value || empty}
    </p>
  );
}

type Review = {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  author: { username: string; displayName?: string | null; avatarUrl?: string | null };
};

function ReviewTile({ review }: { review: Review }) {
  const name = review.author.displayName || review.author.username;
  return (
    <div className="rounded-2xl bg-[#17171f] p-3.5">
      <div className="flex items-center gap-2.5">
        <Avatar className="size-8">
          {review.author.avatarUrl ? <AvatarImage src={review.author.avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-[#1e1e29] text-xs font-bold text-white">
            {name.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{name}</span>
        <span className="flex" aria-label={`${review.rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              aria-hidden="true"
              className={cn("size-4 text-[#ffc83d]", i < review.rating && "fill-[#ffc83d]")}
            />
          ))}
        </span>
      </div>
      {review.content ? (
        <p className="mt-2 text-sm text-[#9c9cb0]">{review.content}</p>
      ) : null}
      <p className="mt-1.5 text-[11px] text-[#6b6b7e]">{formatTimeAgo(review.createdAt)}</p>
    </div>
  );
}

function SimilarGrid({ games }: { games: Game[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-3.5">
      {games.map((game) => (
        <li key={game.id}>
          <Link href={`/game/${game.slug}`} className="block">
            <span className="relative block aspect-[4/3] overflow-hidden rounded-[18px] bg-[#1e1e29]">
              {game.thumbnailUrl ? (
                <Image src={game.thumbnailUrl} alt="" fill sizes="50vw" className="object-cover" />
              ) : null}
            </span>
            <span className="mt-2 block truncate text-sm font-bold text-white">{game.title}</span>
            {game.categories[0]?.name ? (
              <span className="mt-0.5 block truncate text-xs text-[#9c9cb0]">
                {game.categories[0].name}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
