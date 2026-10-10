"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  Brain,
  Car,
  Compass,
  Crosshair,
  Gamepad,
  Gamepad2,
  LayoutGrid,
  Loader2,
  Puzzle,
  Search,
  SearchX,
  Shirt,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { ErrorState } from "@/components/common/ErrorState";
import { fetchGamesPage } from "@/features/games/api/games.api";
import { FavoriteButton } from "@/features/my-games/components/FavoriteButton";
import { getCategories } from "@/lib/api/categories";
import { cn } from "@/lib/utils";
import {
  MobileGameListSkeleton,
  MobileGameListTile,
  MobileMessage,
  MobilePillTabs,
  MobileTabTitle,
} from "./MobileTabUi";

const SORTS = [
  { label: "Trending", value: "trending" },
  { label: "New", value: "newest" },
  { label: "Popular", value: "popular" },
  { label: "A–Z", value: "title" },
] as const;

const ACCENTS = ["#3b82f6", "#14b8a6", "#ffc83d", "#8b5cf6", "#ec4899", "#f97316", "#2bd576"];
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

export function categoryIcon(slug: string): LucideIcon {
  const s = slug.toLowerCase();
  if (s.includes("action")) return Zap;
  if (s.includes("puzzle")) return Puzzle;
  if (s.includes("racing") || s.includes("car")) return Car;
  if (s.includes("sport")) return Trophy;
  if (s.includes("shoot")) return Crosshair;
  if (s.includes("adventure")) return Compass;
  if (s.includes("strategy")) return Brain;
  if (s.includes("arcade")) return Gamepad;
  if (s.includes("girl") || s.includes("dress")) return Shirt;
  if (s.includes("multi")) return Users;
  if (s.includes("hyper") || s.includes("casual")) return Sparkles;
  return Gamepad2;
}

/** Phone layout of search, mirroring the app's Discover tab. */
export function MobileDiscover({ initialQuery = "" }: { initialQuery?: string }) {
  const [text, setText] = useState(initialQuery);
  const [search, setSearch] = useState(initialQuery.trim());
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<string>("trending");
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setSearch(text.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [text]);

  const categories = useQuery({
    queryKey: ["mobile-discover", "categories"],
    queryFn: async () => (await getCategories()).data ?? [],
    staleTime: 5 * 60_000,
  });

  const games = useInfiniteQuery({
    queryKey: ["mobile-discover", "games", { search, category, sort }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchGamesPage({
        page: pageParam,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        category: category ?? undefined,
        sort,
      }),
    getNextPageParam: (last, allPages) => {
      const meta = last.meta;
      if (meta) return meta.page < meta.totalPages ? meta.page + 1 : undefined;
      return last.games.length === PAGE_SIZE ? allPages.length + 1 : undefined;
    },
  });

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = games;
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "600px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = games.data?.pages.flatMap((page) => page.games) ?? [];
  const sortIndex = Math.max(0, SORTS.findIndex((s) => s.value === sort));

  return (
    <div className="space-y-4">
      <MobileTabTitle title="Discover" />

      <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-[#15151d] px-4">
        <Search className="size-5 shrink-0 text-[#9c9cb0]" aria-hidden="true" />
        <input
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Search games…"
          aria-label="Search games"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#9c9cb0] [&::-webkit-search-cancel-button]:hidden"
        />
        {text ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setText("");
              setSearch("");
            }}
            className="grid size-8 place-items-center rounded-full text-[#9c9cb0] hover:text-white"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </label>

      {categories.data?.length ? (
        <ul className="-mx-4 flex gap-3.5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <CategoryItem
            label="All"
            icon={LayoutGrid}
            color="#ffc83d"
            selected={category === null}
            onSelect={() => setCategory(null)}
          />
          {categories.data.map((item, index) => (
            <CategoryItem
              key={item.id}
              label={item.name}
              icon={categoryIcon(item.slug)}
              color={ACCENTS[(index + 1) % ACCENTS.length]}
              selected={category === item.slug}
              onSelect={() => setCategory(item.slug)}
            />
          ))}
        </ul>
      ) : null}

      <div className="py-1">
        <MobilePillTabs
          label="Sort games"
          expanded={false}
          labels={SORTS.map((s) => s.label)}
          selectedIndex={sortIndex}
          onChange={(index) => setSort(SORTS[index].value)}
        />
      </div>

      {games.isPending ? (
        <MobileGameListSkeleton />
      ) : games.isError ? (
        <ErrorState
          title="Games failed to load."
          description="Please check your connection and try again."
          onRetry={() => {
            void games.refetch();
          }}
        />
      ) : items.length === 0 ? (
        <MobileMessage
          icon={SearchX}
          title="No games found"
          message="Try another keyword or category."
        />
      ) : (
        <>
          <ul className="space-y-2.5">
            {items.map((game) => (
              <li key={game.id}>
                <MobileGameListTile
                  game={game}
                  trailing={
                    <FavoriteButton
                      gameId={game.id}
                      source="mobile_discover"
                      className="size-10 shrink-0 bg-transparent"
                    />
                  }
                />
              </li>
            ))}
          </ul>
          <div ref={sentinel} className="flex justify-center py-6">
            {isFetchingNextPage ? (
              <Loader2 className="size-6 animate-spin text-[#ffc83d]" aria-label="Loading more games" />
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

function CategoryItem({
  label,
  icon: Icon,
  color,
  selected,
  onSelect,
}: {
  label: string;
  icon: LucideIcon;
  color: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li className="w-16 shrink-0">
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className="flex w-full flex-col items-center"
      >
        <span
          className="grid size-[54px] place-items-center rounded-[18px] border-[1.5px] transition-colors"
          style={{
            backgroundColor: `${color}${selected ? "4d" : "24"}`,
            borderColor: selected ? color : "transparent",
          }}
        >
          <Icon className="size-[26px]" style={{ color }} aria-hidden="true" />
        </span>
        <span
          className={cn(
            "mt-1.5 w-full truncate text-center text-[11px] font-semibold",
            selected ? "text-white" : "text-[#9c9cb0]",
          )}
        >
          {label}
        </span>
      </button>
    </li>
  );
}
