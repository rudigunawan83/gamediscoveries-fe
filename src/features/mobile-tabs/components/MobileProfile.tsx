"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ChevronRight,
  Crown,
  Diamond,
  Gamepad2,
  Hexagon,
  Flame,
  Heart,
  HelpCircle,
  History,
  LogOut,
  MessageCircle,
  MessagesSquare,
  Settings,
  Smartphone,
  Trophy,
  TrendingUp,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getMyAchievements } from "@/lib/api/achievements";
import { getMyProgress, type LevelInfo } from "@/lib/api/progress";
import { cn } from "@/lib/utils";

const grouped = new Intl.NumberFormat("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

type MenuEntry = { icon: LucideIcon; label: string; accent: string; href?: string };

/** App menu rows; entries without `href` have no web page yet and show "Soon". */
const MAIN_MENU: MenuEntry[] = [
  { icon: Heart, label: "My Favorites", accent: "#ffc83d", href: "/favorites" },
  { icon: History, label: "Play History", accent: "#8b5cf6", href: "/history" },
  { icon: MessageCircle, label: "My Reviews", accent: "#3b82f6", href: "/my-reviews" },
  { icon: Settings, label: "Account Settings", accent: "#2bd576", href: "/settings" },
  { icon: HelpCircle, label: "Help & Support", accent: "#ff5d73", href: "/help" },
];

const COMMUNITY_MENU: MenuEntry[] = [
  { icon: BarChart3, label: "Leaderboard", accent: "#8b5cf6", href: "/leaderboard" },
  { icon: MessagesSquare, label: "Community", accent: "#14b8a6", href: "/community" },
  { icon: Bell, label: "Notifications", accent: "#f97316", href: "/community/notifications" },
  { icon: Smartphone, label: "Download App", accent: "#ffc83d", href: "/download" },
];

const SIGNED_IN_MORE: MenuEntry[] = [
  { icon: TrendingUp, label: "My Progress", accent: "#14b8a6", href: "/progress" },
  { icon: Trophy, label: "Achievements", accent: "#ffc83d", href: "/achievements" },
  ...COMMUNITY_MENU,
];

/** Mirrors the app's Profile tab. */
export function MobileProfile() {
  const { accessToken, user, logout } = useAuth();
  const signedIn = Boolean(accessToken);

  const progressQuery = useQuery({
    queryKey: ["me", "progress"],
    queryFn: async () => (await getMyProgress()).data!,
    enabled: signedIn,
  });
  const achievementsQuery = useQuery({
    queryKey: ["me", "achievements"],
    queryFn: async () => (await getMyAchievements()).data!,
    enabled: signedIn,
  });

  if (!signedIn) {
    return (
      <div className="space-y-6">
        <ProfileHero name="Guest Player" highlighted={false} />
        <p className="text-center text-sm text-[#9c9cb0]">
          Create an account to save XP, streaks, favorites and achievements.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/signup"
            className="grid h-12 place-items-center rounded-2xl bg-[#ffc83d] text-sm font-extrabold text-[#1a1205]"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="grid h-12 place-items-center rounded-2xl border border-[#2a2a37] text-sm font-bold text-white"
          >
            Sign In
          </Link>
        </div>
        <Menu items={MAIN_MENU} prominent />
        <MoreSection items={COMMUNITY_MENU} />
      </div>
    );
  }

  const progress = progressQuery.data;
  const stats = progress?.stats;
  const name = progress?.user.name || user?.displayName || "Player";
  const avatarUrl = user?.avatarUrl ?? progress?.user.avatarUrl;

  return (
    <div className="space-y-6">
      <ProfileHero name={name} subtitle={user?.email} avatarUrl={avatarUrl} highlighted />

      {progressQuery.isError ? (
        <div className="rounded-[18px] border border-[#ff5d73]/40 bg-[#15151d] p-4">
          <p className="text-sm text-[#9c9cb0]">We couldn&apos;t load your progress.</p>
          <button
            type="button"
            onClick={() => {
              void progressQuery.refetch();
              void achievementsQuery.refetch();
            }}
            className="mt-2 text-sm font-bold text-[#ffc83d]"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <XpProgress level={progress?.level} />
          <StatisticsCard
            stats={[
              { icon: Flame, colors: ["#ff4d2e", "#ffc928"], label: "Games", srLabel: "Game sessions played", value: stats?.totalGameSessions },
              { icon: Gamepad2, colors: ["#ffe27a", "#f5a524"], label: "Games", srLabel: "Different games played", value: stats?.uniqueGamesPlayed },
              { icon: Trophy, colors: ["#ffe27a", "#f5a524"], label: "Achievements", srLabel: "Achievements unlocked", value: achievementsQuery.data?.overview.userUnlocked, highlight: true },
              { icon: Hexagon, colors: ["#c084fc", "#6d28d9"], label: "Points", srLabel: "Total XP points", value: progress?.level.totalXp },
            ]}
          />
        </>
      )}

      <Menu items={MAIN_MENU} prominent />
      <MoreSection items={SIGNED_IN_MORE} />

      <button
        type="button"
        onClick={() => {
          void logout();
        }}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#2a2a37] text-sm font-bold text-[#ff5d73]"
      >
        <LogOut className="size-5" aria-hidden="true" />
        Sign Out
      </button>
    </div>
  );
}

function ProfileHero({
  name,
  subtitle,
  avatarUrl,
  highlighted,
}: {
  name: string;
  subtitle?: string | null;
  avatarUrl?: string | null;
  highlighted: boolean;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

  return (
    <div className="relative -mx-4 -mt-6 overflow-hidden px-4 pb-2 pt-4">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,200,61,0.2),transparent_70%)]" />
        {[
          ["8%", "22%", 10, 0.35],
          ["16%", "58%", 7, 0.45],
          ["27%", "12%", 6, 0.3],
          ["70%", "30%", 12, 0.4],
          ["76%", "18%", 7, 0.55],
          ["88%", "46%", 9, 0.35],
          ["93%", "66%", 14, 0.45],
          ["5%", "78%", 12, 0.3],
        ].map(([left, top, size, opacity]) => (
          <span
            key={`${left}-${top}`}
            className="absolute bg-[#ffc83d]"
            style={{ left, top, width: size, height: size, opacity: opacity as number }}
          />
        ))}
        <Gamepad2 className="absolute left-[6%] top-[62%] size-11 text-[#ffc83d]/20" />
        <Diamond className="absolute right-[18%] top-[16%] size-5 text-[#ffc83d]/30" />
        <Crown className="absolute right-[10%] top-[56%] size-8 fill-[#ffc83d]/30 text-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-55% to-[#0b0b10]" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <h1 className="min-h-11 text-[22px] font-extrabold leading-[44px] text-white">Profile</h1>
          <Link
            href="/settings"
            aria-label="Account Settings"
            className="grid size-12 place-items-center rounded-[14px] border border-[#ffc83d]/60 bg-black/45 text-white"
          >
            <Settings className="size-[26px]" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-1 flex flex-col items-center">
          <div
            className={cn(
              "rounded-full p-[5px]",
              highlighted
                ? "bg-gradient-to-b from-[#ffe08a] via-[#ffc83d] to-[#f5a524] shadow-[0_0_36px_2px_rgba(255,200,61,0.55)]"
                : "bg-[#2a2a37]",
            )}
          >
            <Avatar className="size-32">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
              <AvatarFallback
                className={cn(
                  "bg-[radial-gradient(circle_at_50%_35%,#2a2416,#0e0e14)] text-5xl font-black",
                  highlighted ? "text-[#ffc83d]" : "text-[#9c9cb0]",
                )}
              >
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
          <p className="mt-3.5 line-clamp-2 text-center text-[28px] font-black text-white [text-shadow:0_0_12px_rgba(0,0,0,0.54)]">
            {name}
          </p>
          {subtitle ? (
            <p className="mt-0.5 max-w-full truncate text-base font-medium text-[#9c9cb0]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function XpProgress({ level }: { level?: LevelInfo }) {
  const ratio = level ? Math.min(1, Math.max(0, level.progressPercentage / 100)) : 0;
  const label = !level
    ? "Level progress loading"
    : level.isMaxLevel
      ? `Level ${level.level}, maximum level reached`
      : `Level ${level.level}, ${grouped.format(level.currentLevelXp)} of ${grouped.format(level.nextLevelXp)} XP`;

  return (
    <div role="group" aria-label={label}>
      <div
        role="progressbar"
        aria-label="Level progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
        className="h-4 rounded-full border border-white/[0.06] bg-[#1a2230] p-0.5"
      >
        <div
          className="h-full rounded-full bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.16)_0_6px,transparent_6px_12px),linear-gradient(to_bottom,#ffe27a,#ffc83d,#f5a524)] shadow-[0_0_12px_rgba(255,200,61,0.55)] transition-[width] duration-700"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-base font-extrabold text-white">
        <span>{level ? `Level ${level.level}` : "Level —"}</span>
        <span className="truncate">
          {!level ? (
            <span className="font-semibold text-[#9c9cb0]">— XP</span>
          ) : level.isMaxLevel ? (
            <span className="text-[#ffc83d]">MAX LEVEL</span>
          ) : (
            <>
              {grouped.format(level.currentLevelXp)}
              <span className="font-semibold text-[#9c9cb0]">
                {" "}/ {grouped.format(level.nextLevelXp)} XP
              </span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

type Stat = {
  icon: LucideIcon;
  colors: [string, string];
  label: string;
  srLabel: string;
  value?: number;
  highlight?: boolean;
};

function StatisticsCard({ stats }: { stats: Stat[] }) {
  return (
    <ul className="flex divide-x divide-white/10 rounded-[22px] border-[1.4px] border-[#ffc83d]/65 bg-gradient-to-b from-[#1b1a14] to-[#101318] px-1.5 py-[18px] shadow-[0_0_26px_rgba(255,200,61,0.18)]">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const display = stat.value === undefined ? "—" : compact.format(stat.value);
        return (
          <li
            key={stat.srLabel}
            aria-label={`${stat.srLabel}: ${stat.value === undefined ? "not available" : display}`}
            className="flex min-w-0 flex-1 flex-col items-center px-1"
          >
            <Icon
              className="size-[34px]"
              style={{ color: stat.colors[0], filter: `drop-shadow(0 2px 0 ${stat.colors[1]})` }}
              aria-hidden="true"
            />
            <span
              aria-hidden="true"
              className={cn(
                "mt-2 text-[26px] font-black leading-none",
                stat.highlight ? "text-[#ffc83d]" : "text-white",
              )}
            >
              {display}
            </span>
            <span aria-hidden="true" className="mt-1 truncate text-[13px] font-medium text-[#9c9cb0]">
              {stat.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Menu({ items, prominent }: { items: MenuEntry[]; prominent: boolean }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label}>
          <MenuItem item={item} prominent={prominent} />
        </li>
      ))}
    </ul>
  );
}

function MoreSection({ items }: { items: MenuEntry[] }) {
  return (
    <section aria-labelledby="profile-more" className="space-y-2.5">
      <h2 id="profile-more" className="pl-1 text-sm font-bold text-[#9c9cb0]">
        More
      </h2>
      <Menu items={items} prominent={false} />
    </section>
  );
}

function MenuItem({ item, prominent }: { item: MenuEntry; prominent: boolean }) {
  const { icon: Icon, label, accent, href } = item;
  const content = (
    <>
      {prominent ? (
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute right-14 top-1/2 size-16 -translate-y-1/2"
          style={{ color: accent, opacity: 0.1 }}
        />
      ) : null}
      <span className="grid size-10 shrink-0 place-items-center">
        <Icon
          className="size-[30px]"
          style={{ color: accent, filter: `drop-shadow(0 0 7px ${accent}b3)` }}
          aria-hidden="true"
        />
      </span>
      <span className={cn("min-w-0 flex-1 font-bold text-white", prominent ? "text-lg" : "text-base")}>
        {label}
      </span>
      {href ? (
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[10px] border border-white/[0.06] bg-black/35">
          <ChevronRight className="size-5 text-white" aria-hidden="true" />
        </span>
      ) : (
        <span className="shrink-0 rounded-full border border-[#ffc83d]/50 px-2.5 py-1 text-xs font-bold text-[#ffc83d]">
          Soon
        </span>
      )}
    </>
  );

  const className = cn(
    "relative flex items-center gap-4 overflow-hidden rounded-[18px] border px-4 py-3 transition-transform active:scale-[0.98]",
    prominent ? "min-h-[68px]" : "min-h-[60px] border-[#2a2a37] bg-[#15151d]",
    !href && "opacity-60",
  );
  const style = prominent
    ? {
        borderColor: `${accent}8c`,
        background: `linear-gradient(90deg, ${accent}3d 0%, ${accent}14 45%, #12141b 100%)`,
        boxShadow: `0 0 14px ${accent}1f`,
      }
    : undefined;

  return href ? (
    <Link href={href} className={className} style={style}>
      {content}
    </Link>
  ) : (
    <div aria-label={`${label}, coming soon`} className={className} style={style}>
      {content}
    </div>
  );
}
