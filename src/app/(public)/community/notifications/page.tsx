"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  ClipboardCheck,
  Gamepad2,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getNotifications,
  markNotificationsRead,
} from "@/lib/api/community";

type NotificationItem = {
  id: string;
  type: string;
  message?: string;
  createdAt: string;
  readAt?: string | null;
};

const FILTERS = [
  { id: "all", label: "All", longLabel: "All Notifications" },
  { id: "achievements", label: "Achievements", longLabel: "Achievements" },
  { id: "missions", label: "Missions", longLabel: "Missions" },
  { id: "leaderboard", label: "Leaderboard", longLabel: "Leaderboard" },
  { id: "games", label: "Games", longLabel: "Games" },
  { id: "system", label: "System", longLabel: "System" },
] as const;

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "sample-leaderboard",
    type: "LEADERBOARD_RANK_CHANGED",
    message: "You reached #3 on Weekly Leaderboard! Amazing! You moved up 5 positions.",
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    readAt: null,
  },
  {
    id: "sample-achievement",
    type: "ACHIEVEMENT_UNLOCKED",
    message: "New Achievement Unlocked! Congratulations! You unlocked Game Explorer achievement.",
    createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    readAt: null,
  },
  {
    id: "sample-mission",
    type: "MISSION_COMPLETED",
    message: "Daily Mission Completed! You completed Play 3 Different Games and earned 150 XP.",
    createdAt: new Date(Date.now() - 60 * 60_000).toISOString(),
    readAt: null,
  },
  {
    id: "sample-streak",
    type: "STREAK_UPDATED",
    message: "Your Streak is Now 12 Days! Keep it up!",
    createdAt: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
    readAt: null,
  },
  {
    id: "sample-game",
    type: "GAME_RECOMMENDED",
    message: "New Game You Might Like: Racing Hero is trending now.",
    createdAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
    readAt: null,
  },
  {
    id: "sample-reward",
    type: "REWARD_AWARDED",
    message: "You Received a Reward! You earned 200 XP from the Weekly Challenge.",
    createdAt: new Date(Date.now() - 24 * 60 * 60_000).toISOString(),
    readAt: new Date().toISOString(),
  },
];

function categoryFor(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes("achievement")) return "achievements";
  if (normalized.includes("mission") || normalized.includes("challenge")) return "missions";
  if (normalized.includes("leaderboard") || normalized.includes("rank")) return "leaderboard";
  if (normalized.includes("game") || normalized.includes("review") || normalized.includes("community")) return "games";
  return "system";
}

function metaFor(type: string): {
  icon: ReactNode;
  tone: string;
  rail: string;
} {
  const category = categoryFor(type);
  if (category === "achievements") {
    return {
      icon: <ShieldCheck className="h-8 w-8 text-white" />,
      tone: "from-violet-500 to-purple-900",
      rail: "bg-violet-400",
    };
  }
  if (category === "missions") {
    return {
      icon: <ClipboardCheck className="h-8 w-8 text-white" />,
      tone: "from-emerald-400 to-teal-800",
      rail: "bg-emerald-400",
    };
  }
  if (category === "leaderboard") {
    return {
      icon: <Trophy className="h-8 w-8 text-white" />,
      tone: "from-amber-300 to-orange-700",
      rail: "bg-amber-300",
    };
  }
  if (category === "games") {
    return {
      icon: <Gamepad2 className="h-8 w-8 text-white" />,
      tone: "from-sky-400 to-blue-800",
      rail: "bg-sky-400",
    };
  }
  return {
    icon: <Settings className="h-8 w-8 text-white" />,
    tone: "from-slate-400 to-slate-800",
    rail: "bg-slate-400",
  };
}

function titleAndBody(item: NotificationItem) {
  const text = item.message || item.type.replaceAll("_", " ");
  const [first, ...rest] = text.split(/[:.!?]\s+/);
  return {
    title: first || text,
    body: rest.join(". ") || text,
  };
}

function timeAgo(createdAt: string) {
  const ms = Date.now() - new Date(createdAt).getTime();
  const mins = Math.max(1, Math.floor(ms / 60_000));
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function NotificationCard({ item }: { item: NotificationItem }) {
  const meta = metaFor(item.type);
  const unread = !item.readAt;
  const content = titleAndBody(item);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/75 p-4 shadow-lg shadow-black/10 transition hover:border-amber-300/25 hover:bg-white/[0.055]">
      <div className={`absolute bottom-0 left-0 top-0 w-1 ${meta.rail}`} />
      <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${meta.tone} shadow-xl shadow-black/30`}>
          {meta.icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-base font-black text-white">{content.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-400">{content.body}</p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <p className="text-xs text-slate-400">{timeAgo(item.createdAt)}</p>
          <span className={`h-3 w-3 rounded-full ${unread ? "bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.8)]" : "border border-slate-500"}`} />
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-slate-300 transition group-hover:bg-amber-300 group-hover:text-slate-950" type="button">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-3">
        <div className="text-amber-200">{icon}</div>
        <div>
          <p className="font-display text-2xl font-black text-white">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function PreferenceRow({ icon, label, enabled = true }: { icon: ReactNode; label: string; enabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <span className="text-amber-300">{icon}</span>
        {label}
      </div>
      <span className={`relative h-7 w-12 rounded-full p-1 transition ${enabled ? "bg-amber-300" : "bg-slate-600"}`}>
        <span className={`block h-5 w-5 rounded-full bg-white transition ${enabled ? "translate-x-5" : "translate-x-0"}`} />
      </span>
    </div>
  );
}

export default function NotificationsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const notificationsQuery = useQuery({
    queryKey: ["community", "notifications"],
    queryFn: async () => (await getNotifications()).data,
    enabled: Boolean(accessToken),
  });

  const markRead = useMutation({
    mutationFn: () => markNotificationsRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["community", "notifications"],
      });
    },
  });

  const sourceItems = notificationsQuery.data?.items ?? [];
  const items = sourceItems.length > 0 ? sourceItems : SAMPLE_NOTIFICATIONS;
  const unread = notificationsQuery.data?.unread ?? 0;
  const unreadCount = sourceItems.length > 0 ? unread : items.filter((item) => !item.readAt).length;
  const filteredItems = useMemo(
    () =>
      activeFilter === "all"
        ? items
        : items.filter((item) => categoryFor(item.type) === activeFilter),
    [activeFilter, items],
  );
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const item of items) {
      const category = categoryFor(item.type);
      counts[category] = (counts[category] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  if (!accessToken) {
    return (
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950">
          <Bell className="h-10 w-10" />
        </div>
        <h1 className="mt-5 font-display text-4xl font-black text-white">Stay in the Loop</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
          Masuk untuk melihat achievement, mission, leaderboard, game update, dan notifikasi komunitas.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-6 py-3 text-sm font-black text-slate-950"
        >
          Sign in to view notifications
        </Link>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 text-white">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_33%,rgba(245,158,11,0.28),transparent_27%),radial-gradient(circle_at_60%_18%,rgba(124,58,237,0.28),transparent_26%),linear-gradient(110deg,rgba(15,23,42,0.1),rgba(15,23,42,0.9))]" />
        <div className="absolute right-12 top-8 hidden h-56 w-56 rounded-full bg-amber-300/20 blur-3xl lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.35em] text-amber-200">
              <Bell className="h-4 w-4" /> Notifications
            </p>
            <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-6xl">
              Stay in the <span className="text-amber-300">Loop</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Get the latest updates about your achievements, missions, leaderboard ranking,
              new games, community replies, and more.
            </p>
          </div>

          <div className="relative min-h-[245px] overflow-hidden rounded-[2rem] border border-amber-200/20 bg-gradient-to-br from-amber-300/15 via-slate-950/60 to-violet-600/20 p-6">
            <div className="absolute right-10 top-8 grid h-28 w-28 place-items-center rounded-full bg-amber-300/20 text-amber-200">
              <Bell className="h-16 w-16" />
            </div>
            <div className="absolute right-20 top-7 grid h-11 w-11 place-items-center rounded-full bg-rose-500 font-display text-xl font-black text-white">
              {unreadCount}
            </div>
            <div className="absolute bottom-8 left-8 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-violet-400 to-purple-800 shadow-2xl shadow-purple-500/20">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
            <div className="relative z-10 max-w-xs">
              <p className="text-sm font-bold text-amber-100">Never miss a win</p>
              <p className="mt-3 font-display text-5xl font-black text-white">{items.length}</p>
              <p className="text-sm text-slate-300">recent updates</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.slice(0, 6).map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-2xl border px-5 py-3 text-sm font-black transition ${
                activeFilter === filter.id
                  ? "border-amber-300 bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "border-white/10 bg-slate-950/70 text-slate-300 hover:border-white/20"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-sm font-bold text-slate-200 disabled:opacity-50"
          disabled={markRead.isPending || unreadCount === 0 || sourceItems.length === 0}
          onClick={() => markRead.mutate()}
          type="button"
        >
          <Check className="h-4 w-4" /> Mark all as read
        </button>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {notificationsQuery.isPending ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/75 p-6 text-sm text-slate-300">
              Loading notifications…
            </div>
          ) : (
            filteredItems.map((item) => <NotificationCard key={item.id} item={item} />)
          )}
          {!notificationsQuery.isPending && filteredItems.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-slate-950/75 p-5 text-sm text-slate-400">
              No notifications in this category yet.
            </p>
          ) : null}
        </div>

        <aside className="space-y-5">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
            <h2 className="flex items-center gap-3 font-display text-xl font-black text-white">
              <BarChart3 className="h-5 w-5 text-violet-300" /> Notification Summary
            </h2>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <SummaryCard icon={<Star className="h-5 w-5" />} label="Unread" value={unreadCount} />
              <SummaryCard icon={<Bell className="h-5 w-5" />} label="This Week" value={items.length} />
              <SummaryCard icon={<Zap className="h-5 w-5" />} label="Total" value={Math.max(items.length, sourceItems.length)} />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
            <h2 className="flex items-center gap-3 font-display text-xl font-black text-white">
              <Sparkles className="h-5 w-5 text-violet-300" /> Filter Notifications
            </h2>
            <div className="mt-5 space-y-2">
              {FILTERS.map((filter) => {
                const active = activeFilter === filter.id;
                const count = filterCounts[filter.id] ?? 0;
                const icon = filter.id === "achievements"
                  ? <ShieldCheck className="h-4 w-4" />
                  : filter.id === "missions"
                    ? <ClipboardCheck className="h-4 w-4" />
                    : filter.id === "leaderboard"
                      ? <Trophy className="h-4 w-4" />
                      : filter.id === "games"
                        ? <Gamepad2 className="h-4 w-4" />
                        : filter.id === "system"
                          ? <Settings className="h-4 w-4" />
                          : <Bell className="h-4 w-4" />;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition ${
                      active
                        ? "border-amber-300 bg-amber-300/10 text-amber-200"
                        : "border-transparent text-slate-300 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="flex items-center gap-3">{icon}{filter.longLabel}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-amber-300 text-slate-950" : "bg-white/10 text-slate-300"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/20">
            <h2 className="flex items-center gap-3 font-display text-xl font-black text-white">
              <Settings className="h-5 w-5 text-violet-300" /> Preferences
            </h2>
            <p className="mt-1 text-xs text-slate-400">Choose what notifications you want to receive.</p>
            <div className="mt-5 space-y-4">
              <PreferenceRow icon={<Bell className="h-4 w-4" />} label="Achievements" />
              <PreferenceRow icon={<ClipboardCheck className="h-4 w-4" />} label="Missions" />
              <PreferenceRow icon={<Trophy className="h-4 w-4" />} label="Leaderboard" />
              <PreferenceRow icon={<Gamepad2 className="h-4 w-4" />} label="Game Updates" />
              <PreferenceRow icon={<MessageCircle className="h-4 w-4" />} label="Community" enabled={false} />
              <PreferenceRow icon={<Settings className="h-4 w-4" />} label="System Notifications" />
            </div>
            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/40 px-4 py-3 text-sm font-black text-amber-200 hover:bg-amber-300 hover:text-slate-950" type="button">
              Manage Preferences <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
