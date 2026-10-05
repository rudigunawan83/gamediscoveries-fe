"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronRight,
  Edit3,
  Gamepad2,
  Heart,
  Home,
  Image as ImageIcon,
  Lightbulb,
  MessageCircle,
  MoreHorizontal,
  Play,
  PlusSquare,
  Search,
  Share2,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import {
  getCommunityHome,
  type CommunityGame,
  type CommunityHome as CommunityHomeDto,
  type CommunityPost,
  type FeedItem,
} from "@/lib/api/community";
import { analytics } from "@/lib/analytics/client";

const FEED_TABS = ["Latest", "Trending", "Most Liked", "Following"] as const;

const SIDEBAR_ITEMS = [
  ["All Posts", Home, "all"],
  ["Discussions", MessageCircle, "discussion"],
  ["Game Reviews", Star, "reviews"],
  ["Tips & Guides", Lightbulb, "tips"],
  ["Game Requests", PlusSquare, "requests"],
  ["Showcase", ImageIcon, "showcase"],
  ["Events", CalendarDays, "events"],
] as const;

const CATEGORIES = [
  ["General Discussion", MessageCircle, "1.2K"],
  ["Game Recommendations", Gamepad2, "980"],
  ["Tips & Guides", Lightbulb, "650"],
  ["Game Reviews", Star, "720"],
  ["Game Requests", PlusSquare, "430"],
  ["Gameplay Clips", Play, "310"],
  ["Events & Tournaments", Trophy, "280"],
  ["Off Topic", Share2, "190"],
] as const;

const FALLBACK_POSTS = [
  {
    title: "This game is amazing!",
    content: "I just finished playing Space Runner and it is super fun! The controls are smooth and the graphics are awesome.",
    author: "RizkyGamer",
    type: "Game Reviews",
    likes: 124,
    comments: 28,
    tone: "from-sky-400 to-indigo-800",
  },
  {
    title: "5 Tips to Get Higher Score in Block Puzzle",
    content: "Here are some tips that helped me reach a new high score in Block Puzzle.",
    author: "LunaPlay",
    type: "Tips & Guides",
    likes: 86,
    comments: 14,
    tone: "from-amber-300 to-orange-600",
  },
  {
    title: "Weekly Community Event: Screenshot Challenge",
    content: "Share your best gaming moment screenshot and win exclusive badges.",
    author: "GameMaster",
    type: "Announcements",
    likes: 210,
    comments: 57,
    tone: "from-emerald-300 to-blue-700",
  },
] as const;

const FALLBACK_EVENTS = [
  ["Screenshot Challenge", "Share your best gaming moments", "Oct 5 - Oct 12, 2026", "from-violet-400 to-purple-800"],
  ["Racing Hero Tournament", "Compete and win exclusive badges", "Oct 10, 2026 · 19:00 WIB", "from-sky-400 to-blue-700"],
  ["Community Game Night", "Play together with the community", "Oct 15, 2026 · 20:00 WIB", "from-amber-300 to-orange-600"],
] as const;

function initials(name?: string | null) {
  return (name || "U")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function Avatar({ name, index, size = "md" }: { name?: string | null; index: number; size?: "sm" | "md" | "lg" }) {
  const sizes = size === "lg" ? "h-20 w-20 text-2xl" : size === "sm" ? "h-10 w-10 text-xs" : "h-12 w-12 text-sm";
  const tones = [
    "from-amber-300 via-orange-400 to-rose-500",
    "from-sky-300 via-cyan-400 to-blue-700",
    "from-pink-300 via-fuchsia-400 to-purple-700",
    "from-emerald-300 via-teal-400 to-cyan-700",
  ];
  return (
    <div className={`${sizes} grid shrink-0 place-items-center rounded-full border-2 border-white/20 bg-gradient-to-br ${tones[index % tones.length]} font-display font-black text-slate-950 shadow-xl shadow-black/25`}>
      {initials(name)}
    </div>
  );
}

function GameThumb({ game, tone = "from-sky-400 to-indigo-800", withPlay = false }: { game?: CommunityGame | null; tone?: string; withPlay?: boolean }) {
  return (
    <div
      className={`relative h-24 w-36 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${tone}`}
      style={game?.thumbnailUrl ? { backgroundImage: `url(${game.thumbnailUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
      {withPlay ? (
        <span className="absolute inset-0 m-auto grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white">
          <Play className="h-5 w-5 fill-current" />
        </span>
      ) : null}
      <p className="absolute bottom-2 left-2 right-2 truncate font-display text-sm font-black text-white">
        {game?.title ?? "Space Runner"}
      </p>
    </div>
  );
}

function HeroStat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-sky-300 shadow-lg shadow-black/20">{icon}</span>
      <div>
        <p className="font-display text-sm font-black leading-none text-white sm:text-base">{value}</p>
        <p className="mt-1 text-[10px] leading-none text-slate-300 sm:text-xs">{label}</p>
      </div>
    </div>
  );
}

function PostCard({
  post,
  feed,
  index,
}: {
  post?: CommunityPost;
  feed?: FeedItem;
  index: number;
}) {
  const fallback = FALLBACK_POSTS[index % FALLBACK_POSTS.length];
  const title = post?.title ?? feed?.message ?? fallback.title;
  const content = post?.content ?? fallback.content;
  const author = post?.author.displayName || post?.author.username || feed?.user.displayName || feed?.user.username || fallback.author;
  const type = post?.type?.replaceAll("_", " ") || feed?.activityType?.replaceAll("_", " ") || fallback.type;
  const likes = post?.reactionCount ?? feed?.reactionCount ?? fallback.likes;
  const comments = post?.commentCount ?? feed?.commentCount ?? fallback.comments;
  const game = post?.game ?? feed?.game;

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/75 p-4 shadow-lg shadow-black/10 transition hover:border-amber-300/25 hover:bg-white/[0.055]">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <Avatar name={author} index={index} size="sm" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-black text-white">{author}</p>
                <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-bold text-slate-300">Level {28 - index * 3}</span>
                <span className="text-xs text-slate-500">· {index + 2} hours ago · in {type}</span>
              </div>
            </div>
            <MoreHorizontal className="ml-auto h-4 w-4 text-slate-500" />
          </div>
          <h3 className="font-display text-lg font-black text-white">{title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">{content}</p>
          <div className="mt-4 flex items-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2 text-rose-300"><Heart className="h-4 w-4 fill-current" /> {likes}</span>
            <span className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> {comments}</span>
            <span className="flex items-center gap-2"><Share2 className="h-4 w-4" /></span>
          </div>
        </div>
        <GameThumb game={game} tone={fallback.tone} withPlay={index === 4} />
      </div>
    </article>
  );
}

function Spotlight({ data }: { data: CommunityHomeDto }) {
  const players = data.topPlayers.slice(0, 3);
  const fallback = [
    { rank: 2, userId: "luna", username: "lunaplay", displayName: "LunaPlay", score: 1920 },
    { rank: 1, userId: "rizky", username: "rizkygamer", displayName: "RizkyGamer", score: 2340 },
    { rank: 3, userId: "danu", username: "danublitz", displayName: "DanuBlitz", score: 1750 },
  ];
  const list = players.length >= 3 ? players : fallback;
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xl font-black text-white">
          <Trophy className="h-5 w-5 text-amber-300" /> Community Spotlight
        </h2>
        <Link href="/community/leaderboards" className="text-xs font-bold text-amber-200">View All</Link>
      </div>
      <div className="grid grid-cols-3 items-end gap-3 text-center">
        {list.map((player, index) => (
          <div key={player.userId} className={index === 1 ? "-mt-4" : "mt-4"}>
            <Avatar name={player.displayName || player.username} index={index + 1} size={index === 1 ? "lg" : "md"} />
            <p className="mt-3 text-sm font-black text-white">{player.displayName || player.username}</p>
            <p className="text-xs text-slate-400">{player.score.toLocaleString()} points</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CommunityHome() {
  const [activeFeedTab, setActiveFeedTab] = useState<(typeof FEED_TABS)[number]>("Latest");
  const [activeSidebar, setActiveSidebar] = useState("all");
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["community", "home"],
    queryFn: async () => (await getCommunityHome()).data,
    staleTime: 30_000,
  });

  useEffect(() => {
    analytics.track("community_viewed", { source: "community_home" });
  }, []);

  if (isPending) {
    return (
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center text-slate-300">
        Loading community…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <button
        type="button"
        className="text-sm text-primary underline"
        onClick={() => void refetch()}
      >
        Failed to load community. Retry
      </button>
    );
  }

  const feedPosts = data.trendingDiscussions.length > 0
    ? data.trendingDiscussions
    : [];
  const feedItems = data.feed;
  const postCount = Math.max(feedPosts.length, feedItems.length, FALLBACK_POSTS.length);
  const eventCards = data.activeChallenges.length > 0
    ? data.activeChallenges.map((event) => ({
        title: event.title,
        description: event.description,
        meta: `Progress ${event.progress}/${event.targetValue}`,
        tone: "from-violet-400 to-purple-800",
      }))
    : FALLBACK_EVENTS.map(([title, description, meta, tone]) => ({
        title,
        description,
        meta,
        tone,
      }));

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 text-white">
      <section
        className="relative min-h-[250px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950 shadow-2xl shadow-black/30 sm:min-h-[285px]"
        style={{
          backgroundImage: "url('/images/community-hero.jpg')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/78 to-slate-950/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
        <div className="relative flex min-h-[250px] flex-col justify-end p-5 sm:min-h-[285px] sm:p-7">
          <div className="max-w-xl">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-amber-200">
              <Users className="h-4 w-4" /> Community
            </p>
            <h1 className="font-display text-3xl font-black leading-none text-white sm:text-5xl">
              Play. <span className="text-amber-300">Share.</span> Connect.
            </h1>
            <p className="mt-4 max-w-md text-xs leading-5 text-slate-200 sm:text-sm sm:leading-6">
              Join a community of gamers, share your experiences, get tips, discover new games, and make new friends!
            </p>
            <div className="mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              <HeroStat icon={<Users className="h-5 w-5 text-fuchsia-300" />} value="12.4K" label="Members" />
              <HeroStat icon={<MessageCircle className="h-5 w-5 text-sky-300" />} value="3.2K" label="Discussions" />
              <HeroStat icon={<Gamepad2 className="h-5 w-5 text-emerald-300" />} value="850" label="Game Reviews" />
              <HeroStat icon={<Search className="h-5 w-5 text-cyan-300" />} value="320" label="Online Now" />
            </div>
          </div>
          <button
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-400 px-5 py-3 text-xs font-black text-slate-950 shadow-xl shadow-amber-950/30 transition hover:scale-[1.02] sm:absolute sm:bottom-7 sm:right-7 sm:mt-0"
            type="button"
          >
            <Edit3 className="h-4 w-4" /> Create Post
          </button>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[250px_1fr_340px]">
        <aside className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/20">
          <div className="space-y-1">
            {SIDEBAR_ITEMS.map(([label, Icon, id]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSidebar(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition ${
                  activeSidebar === id
                    ? "bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                <Icon className="h-5 w-5" /> {label}
              </button>
            ))}
          </div>
          <div className="my-5 h-px bg-white/10" />
          <p className="px-4 text-xs font-black uppercase tracking-[0.25em] text-amber-200">Categories</p>
          <div className="mt-4 space-y-1">
            {CATEGORIES.map(([label, Icon, count]) => (
              <button key={label} type="button" className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/[0.05]">
                <span className="flex items-center gap-3"><Icon className="h-4 w-4 text-sky-300" /> {label}</span>
                <span className="text-xs text-slate-500">{count}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/75 p-2">
            <div className="flex flex-wrap gap-2">
              {FEED_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFeedTab(tab)}
                  className={`rounded-2xl px-5 py-2.5 text-sm font-black ${
                    activeFeedTab === tab
                      ? "bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950"
                      : "text-slate-400 hover:bg-white/[0.05]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-5 py-2.5 text-sm font-black text-slate-950" type="button">
              <Edit3 className="h-4 w-4" /> Create Post
            </button>
          </div>

          {Array.from({ length: Math.max(5, postCount) }).slice(0, 5).map((_, index) => (
            <PostCard
              key={feedPosts[index]?.id ?? feedItems[index]?.id ?? `fallback-${index}`}
              post={feedPosts[index]}
              feed={feedItems[index]}
              index={index}
            />
          ))}
        </main>

        <aside className="space-y-5">
          <Spotlight data={data} />

          <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl font-black text-white">
                <CalendarDays className="h-5 w-5 text-violet-300" /> Upcoming Events
              </h2>
              <Link href="/community/challenges" className="text-xs font-bold text-amber-200">View All</Link>
            </div>
            <div className="space-y-3">
              {eventCards.slice(0, 3).map((event) => (
                <Link key={event.title} href="/community/challenges" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 hover:border-amber-300/30">
                  <div className={`h-16 w-16 shrink-0 rounded-xl bg-gradient-to-br ${event.tone}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-white">{event.title}</p>
                    <p className="line-clamp-1 text-xs text-slate-400">{event.description}</p>
                    <p className="mt-1 text-xs text-slate-500">{event.meta}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl font-black text-white">
                <Gamepad2 className="h-5 w-5 text-sky-300" /> Popular Games
              </h2>
              <Link href="/games" className="text-xs font-bold text-amber-200">View All</Link>
            </div>
            <ol className="space-y-3">
              {(data.popularGames.length > 0 ? data.popularGames : [
                { id: "space", slug: "space-runner", title: "Space Runner" },
                { id: "block", slug: "block-puzzle", title: "Block Puzzle" },
                { id: "racing", slug: "racing-hero", title: "Racing Hero" },
                { id: "zombie", slug: "zombie-survival", title: "Zombie Survival" },
                { id: "mystic", slug: "mystic-quest", title: "Mystic Quest" },
              ]).slice(0, 5).map((game, index) => (
                <li key={game.id}>
                  <Link href={`/game/${game.slug}/community`} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl p-2 hover:bg-white/[0.04]">
                    <span className="font-display text-2xl font-black text-white">{index + 1}</span>
                    <div>
                      <p className="text-sm font-black text-white">{game.title}</p>
                      <p className="text-xs text-slate-500">{342 - index * 38} discussions</p>
                    </div>
                    <GameThumb game={game} tone="from-sky-400 to-indigo-800" />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </section>
    </div>
  );
}
