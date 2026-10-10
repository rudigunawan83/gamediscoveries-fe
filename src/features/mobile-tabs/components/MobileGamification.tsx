"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  Compass,
  Flame,
  Gamepad2,
  Heart,
  Lock,
  Trophy,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useXpRuleLabel } from "@/features/progress/hooks/useXpRuleLabel";
import { getMyAchievements, type AchievementItem } from "@/lib/api/achievements";
import { getMyProgress, getMyXpTransactions } from "@/lib/api/progress";
import { useFormats } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import { MobileSubpageHeader } from "./MobileSubpageHeader";
import { MobileMessage, MobilePillTabs } from "./MobileTabUi";

const MUTED = "#6b6b7e";

export function achievementColor(difficulty: string) {
  switch (difficulty.toUpperCase()) {
    case "BRONZE":
    case "EASY":
    case "COMMON":
      return "#d08a4e";
    case "SILVER":
    case "MEDIUM":
    case "UNCOMMON":
      return "#c0c6d4";
    case "GOLD":
    case "HARD":
    case "RARE":
      return "#ffc83d";
    case "PLATINUM":
    case "EPIC":
      return "#14b8a6";
    case "LEGENDARY":
    case "DIAMOND":
      return "#8b5cf6";
    default:
      return "#3b82f6";
  }
}

export function achievementIcon(category: string): LucideIcon {
  const c = category.toUpperCase();
  if (c.includes("SOCIAL") || c.includes("COMMUNITY")) return Users;
  if (c.includes("EXPLOR") || c.includes("DISCOVER")) return Compass;
  if (c.includes("STREAK")) return Flame;
  if (c.includes("COLLECT") || c.includes("FAVORITE")) return Heart;
  if (c.includes("LEVEL") || c.includes("XP")) return Zap;
  if (c.includes("PLAY") || c.includes("GAME")) return Gamepad2;
  return Trophy;
}

export function humanizeCode(code: string) {
  return code
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");
}

const HEX_OUTER = "50,1 92.4,25.5 92.4,74.5 50,99 7.6,74.5 7.6,25.5";
const HEX_INNER = "50,9 85.5,29.5 85.5,70.5 50,91 14.5,70.5 14.5,29.5";

/** Faceted hexagon badge from the app (level and achievement badges). */
export function HexBadge({
  color,
  icon: Icon,
  size,
  locked = false,
  children,
}: {
  color: string;
  icon?: LucideIcon;
  size: number;
  locked?: boolean;
  children?: ReactNode;
}) {
  const base = locked ? MUTED : color;
  const id = `hex-${base.slice(1)}`;
  const ContentIcon = locked ? Lock : Icon;

  return (
    <span
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute inset-0 size-full"
        style={locked ? undefined : { filter: `drop-shadow(0 0 6px ${base}73)` }}
      >
        <defs>
          <linearGradient id={`${id}-o`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: `color-mix(in srgb, ${base} 65%, white)` }} />
            <stop offset="1" style={{ stopColor: `color-mix(in srgb, ${base} 75%, black)` }} />
          </linearGradient>
          <linearGradient id={`${id}-i`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: `color-mix(in srgb, ${base} 85%, black)` }} />
            <stop offset="1" style={{ stopColor: `color-mix(in srgb, ${base} 45%, black)` }} />
          </linearGradient>
        </defs>
        <polygon points={HEX_OUTER} fill={`url(#${id}-o)`} />
        <polygon points={HEX_INNER} fill={`url(#${id}-i)`} />
      </svg>
      <span className="relative grid place-items-center">
        {children ??
          (ContentIcon ? (
            <ContentIcon
              aria-hidden="true"
              style={{ width: size * 0.42, height: size * 0.42 }}
              className={locked ? "text-[#9c9cb0]" : "text-white"}
            />
          ) : null)}
      </span>
    </span>
  );
}

function XpBar({ ratio, height = 8, label }: { ratio: number; height?: number; label?: string }) {
  const clamped = Number.isFinite(ratio) ? Math.min(1, Math.max(0, ratio)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className="overflow-hidden rounded-full bg-[#1e1e29]"
      style={{ height }}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#ffc83d] to-[#f5a524] transition-[width] duration-700"
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("Common");
  return (
    <div className="rounded-[18px] border border-[#ff5d73]/40 bg-[#15151d] p-4">
      <p className="text-sm text-[#9c9cb0]">{t("errorGeneric")}</p>
      <button type="button" onClick={onRetry} className="mt-2 text-sm font-bold text-[#ffc83d]">
        {t("retry")}
      </button>
    </div>
  );
}

function StatTile({
  icon: Icon,
  color,
  value,
  label,
}: {
  icon: LucideIcon;
  color: string;
  value: string;
  label: string;
}) {
  return (
    <span aria-label={`${label}: ${value}`} className="flex flex-col items-center text-center">
      <Icon aria-hidden="true" className="size-[26px]" style={{ color }} />
      <span aria-hidden="true" className="mt-1.5 text-[22px] font-extrabold text-white">
        {value}
      </span>
      <span aria-hidden="true" className="text-xs text-[#9c9cb0]">
        {label}
      </span>
    </span>
  );
}

/** Mirrors the app's My Progress screen. */
export function MobileProgress() {
  const { accessToken } = useAuth();
  const signedIn = Boolean(accessToken);
  const { grouped, compact, timeAgo } = useFormats();
  const t = useTranslations("Gamification");
  const tProfile = useTranslations("Profile");
  const ruleLabel = useXpRuleLabel();

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
  const xpQuery = useQuery({
    queryKey: ["me", "xp", "recent"],
    queryFn: async () => (await getMyXpTransactions({ page: 1, pageSize: 10 })).data?.items ?? [],
    enabled: signedIn,
  });

  const progress = progressQuery.data;
  const level = progress?.level;

  return (
    <div>
      <MobileSubpageHeader title={tProfile("myProgress")} />
      {!signedIn ? (
        <MobileMessage
          icon={TrendingUp}
          title={t("progressSignInTitle")}
          message={t("progressSignInMessage")}
          signIn
        />
      ) : progressQuery.isError ? (
        <LoadError onRetry={() => void progressQuery.refetch()} />
      ) : !progress || !level ? (
        <div className="space-y-4" aria-hidden="true">
          <div className="mx-auto size-[120px] rounded-full bg-[#1e1e29]" />
          <div className="h-2.5 rounded-full bg-[#1e1e29]" />
          <div className="h-20 rounded-[18px] bg-[#17171f]" />
        </div>
      ) : (
        <div className="pb-4 pt-2">
          <div className="flex justify-center">
            <HexBadge color="#ffc83d" size={120}>
              <span className="flex flex-col items-center leading-none text-[#1a1205]">
                <span className="text-sm font-extrabold">{t("levelShort")}</span>
                <span className="text-[38px] font-black">{level.level}</span>
              </span>
            </HexBadge>
          </div>
          {level.title ? (
            <p className="mt-3 text-center text-base font-extrabold text-[#ffc83d]">{level.title}</p>
          ) : null}

          <div className="mt-4">
            <XpBar ratio={level.progressPercentage / 100} height={10} label={t("levelProgress")} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[#9c9cb0]">
            <span>
              {level.isMaxLevel
                ? t("maxLevelReached")
                : t("xpProgress", {
                    current: grouped.format(level.currentLevelXp),
                    next: grouped.format(level.nextLevelXp),
                  })}
            </span>
            <span>{t("totalXp", { xp: grouped.format(level.totalXp) })}</span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            <StatTile
              icon={Flame}
              color="#f97316"
              value={t("streakDaysShort", { days: progress.stats.currentStreak })}
              label={t("currentStreak")}
            />
            <StatTile
              icon={Gamepad2}
              color="#3b82f6"
              value={compact.format(progress.stats.uniqueGamesPlayed)}
              label={t("gamesPlayed")}
            />
            <Link href="/achievements" className="rounded-2xl">
              <StatTile
                icon={Trophy}
                color="#ffc83d"
                value={
                  achievementsQuery.data ? String(achievementsQuery.data.overview.userUnlocked) : "—"
                }
                label={t("achievements")}
              />
            </Link>
          </div>

          <h2 className="mt-7 text-lg font-extrabold text-white">{t("recentXp")}</h2>
          <div className="mt-3">
            {xpQuery.isError ? (
              <LoadError onRetry={() => void xpQuery.refetch()} />
            ) : !xpQuery.data ? (
              <div className="space-y-2.5" aria-hidden="true">
                {[0, 1, 2].map((key) => (
                  <div key={key} className="h-[60px] rounded-2xl bg-[#17171f]" />
                ))}
              </div>
            ) : xpQuery.data.length === 0 ? (
              <p className="text-sm text-[#9c9cb0]">{t("noXp")}</p>
            ) : (
              <ul className="space-y-2.5">
                {xpQuery.data.map((item) => {
                  const positive = item.xpAmount >= 0;
                  return (
                    <li
                      key={item.transactionId}
                      className="flex items-center gap-3 rounded-2xl bg-[#17171f] px-3.5 py-3"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#ffc83d]/15">
                        <Zap className="size-5 text-[#ffc83d]" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-white">
                          {ruleLabel(item.ruleCode, item.description)}
                        </span>
                        <span className="block text-[11px] text-[#6b6b7e]">
                          {timeAgo(item.createdAt)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-black",
                          positive ? "text-[#ffc83d]" : "text-[#ff5d73]",
                        )}
                      >
                        {t(positive ? "xpReward" : "xpAmount", { xp: grouped.format(item.xpAmount) })}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const isHidden = (item: AchievementItem) => item.isSecret && !item.isUnlocked;

/** Mirrors the app's Achievements screen. */
export function MobileAchievements() {
  const { accessToken } = useAuth();
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState<AchievementItem | null>(null);
  const t = useTranslations("Gamification");

  const query = useQuery({
    queryKey: ["me", "achievements"],
    queryFn: async () => (await getMyAchievements()).data!,
    enabled: Boolean(accessToken),
  });

  const data = query.data;
  const categories = [...new Set((data?.items ?? []).map((a) => a.category).filter(Boolean))];
  const activeTab = tab > categories.length ? 0 : tab;
  const items =
    activeTab === 0
      ? (data?.items ?? [])
      : (data?.items ?? []).filter((a) => a.category === categories[activeTab - 1]);
  const total = data
    ? data.overview.activeDefinitions > 0
      ? data.overview.activeDefinitions
      : data.items.length
    : 0;
  const unlocked = data?.overview.userUnlocked ?? 0;

  return (
    <div>
      <MobileSubpageHeader title={t("achievements")} />
      {!accessToken ? (
        <MobileMessage
          icon={Trophy}
          title={t("achievementsSignInTitle")}
          message={t("achievementsSignInMessage")}
          signIn
        />
      ) : query.isError ? (
        <LoadError onRetry={() => void query.refetch()} />
      ) : !data ? (
        <div className="grid grid-cols-3 gap-x-3 gap-y-4 pt-16" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => (
            <div key={index} className="mx-auto size-[76px] rounded-full bg-[#1e1e29]" />
          ))}
        </div>
      ) : (
        <>
          <MobilePillTabs
            label={t("achievementCategories")}
            expanded={false}
            labels={[t("all"), ...categories.map(humanizeCode)]}
            selectedIndex={activeTab}
            onChange={setTab}
          />
          <div className="pb-5 pt-[18px]">
            <p className="text-base font-black text-white">
              {t.rich("unlockedOf", {
                unlocked,
                total,
                highlight: (chunks) => <span className="text-[#ffc83d]">{chunks}</span>,
              })}
            </p>
            <div className="mt-2.5">
              <XpBar ratio={total === 0 ? 0 : unlocked / total} label={t("achievementsUnlocked")} />
            </div>
          </div>

          {items.length === 0 ? (
            <MobileMessage icon={Trophy} message={t("emptyCategory")} />
          ) : (
            <ul className="grid grid-cols-3 gap-x-3 gap-y-4 pb-6">
              {items.map((item) => {
                const hidden = isHidden(item);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-label={hidden ? t("secretLabel") : item.title}
                      onClick={() => setSelected(item)}
                      className="flex w-full flex-col items-center rounded-2xl text-center"
                    >
                      <HexBadge
                        color={achievementColor(item.difficulty)}
                        icon={achievementIcon(item.category)}
                        size={76}
                        locked={!item.isUnlocked}
                      />
                      <span
                        className={cn(
                          "mt-2 line-clamp-2 text-xs font-bold",
                          item.isUnlocked ? "text-white" : "text-[#9c9cb0]",
                        )}
                      >
                        {hidden ? "???" : item.title}
                      </span>
                      {!item.isUnlocked && !hidden && item.targetValue > 0 ? (
                        <span className="mt-1.5 w-full">
                          <XpBar ratio={item.progressValue / item.targetValue} height={4} />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="mx-auto max-w-xl rounded-t-[28px] border-[#2a2a37] bg-[#15151d] px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3"
        >
          {selected ? <AchievementDetails item={selected} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AchievementDetails({ item }: { item: AchievementItem }) {
  const hidden = isHidden(item);
  const { grouped, timeAgo } = useFormats();
  const t = useTranslations("Gamification");
  return (
    <div className="flex flex-col items-center text-center">
      <span aria-hidden="true" className="mb-4 h-1 w-8 rounded-full bg-[#6b6b7e]" />
      <HexBadge
        color={achievementColor(item.difficulty)}
        icon={achievementIcon(item.category)}
        size={96}
        locked={!item.isUnlocked}
      />
      <SheetTitle className="mt-3.5 text-xl font-black text-white">
        {hidden ? t("secretTitle") : item.title}
      </SheetTitle>
      <SheetDescription className="mt-1.5 text-sm text-[#9c9cb0]">
        {hidden ? t("secretHint") : item.description}
      </SheetDescription>
      <p className="mt-3.5 text-sm font-bold text-white">
        {item.isUnlocked
          ? item.unlockedAt
            ? t("unlockedAt", { time: timeAgo(item.unlockedAt) })
            : t("unlocked")
          : hidden
            ? t("locked")
            : t("progressOf", { current: item.progressValue, target: item.targetValue })}
      </p>
      {item.rewardXp > 0 ? (
        <p className="mt-1 text-sm font-black text-[#ffc83d]">
          {t("xpReward", { xp: grouped.format(item.rewardXp) })}
        </p>
      ) : null}
    </div>
  );
}
