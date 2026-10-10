"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Compass,
  Flag,
  Flame,
  Gamepad2,
  Gift,
  Heart,
  Hourglass,
  MessagesSquare,
  Share2,
  Star,
  type LucideIcon,
} from "lucide-react";
import { ErrorState } from "@/components/common/ErrorState";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getMyMissions, type MissionDto } from "@/lib/api/missions";
import { useFormats } from "@/lib/i18n/format";
import { MobileGameListSkeleton, MobileMessage, MobilePillTabs, MobileTabTitle } from "./MobileTabUi";

export function missionVisual(requirementType: string): [LucideIcon, string] {
  const t = requirementType.toUpperCase();
  if (t.includes("FAVORITE")) return [Heart, "#ec4899"];
  if (t.includes("REVIEW") || t.includes("RATE")) return [Star, "#ffc83d"];
  if (t.includes("COMMENT") || t.includes("POST") || t.includes("COMMUNITY")) {
    return [MessagesSquare, "#14b8a6"];
  }
  if (t.includes("STREAK") || t.includes("LOGIN")) return [Flame, "#f97316"];
  if (t.includes("UNIQUE") || t.includes("DISCOVER") || t.includes("NEW")) {
    return [Compass, "#8b5cf6"];
  }
  if (t.includes("MINUTE") || t.includes("TIME") || t.includes("DURATION")) {
    return [Clock, "#3b82f6"];
  }
  if (t.includes("SHARE")) return [Share2, "#2bd576"];
  return [Gamepad2, "#3b82f6"];
}

const isCompleted = (mission: MissionDto) => mission.status === "COMPLETED";

/** Mirrors the app's Missions tab: Daily/Weekly pills, reward banner, mission cards. */
export function MobileMissions() {
  const { accessToken } = useAuth();
  const [tab, setTab] = useState(0);
  const t = useTranslations("Gamification");
  const tDiscovery = useTranslations("Discovery");
  const tNav = useTranslations("Nav");

  const query = useQuery({
    queryKey: ["me", "missions"],
    queryFn: async () => (await getMyMissions()).data!,
    enabled: Boolean(accessToken),
    refetchInterval: 60_000,
  });

  let body: ReactNode;
  if (!accessToken) {
    body = (
      <MobileMessage
        icon={Flag}
        title={t("missionsSignInTitle")}
        message={t("missionsSignInMessage")}
        signIn
      />
    );
  } else if (query.isPending) {
    body = <MobileGameListSkeleton count={4} />;
  } else if (query.isError || !query.data) {
    body = (
      <ErrorState
        title={t("missionsError")}
        description={tDiscovery("connectionError")}
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  } else {
    const daily = tab === 0;
    const items = daily ? query.data.daily : query.data.weekly;
    const expiresAt = daily ? query.data.dailyExpiresAt : query.data.weeklyExpiresAt;
    body = (
      <div className="space-y-4">
        <MobilePillTabs
          label={t("missionPeriod")}
          labels={[t("daily"), t("weekly")]}
          selectedIndex={tab}
          onChange={setTab}
        />
        <MissionsBanner daily={daily} missions={items} expiresAt={expiresAt} />
        {items.length === 0 ? (
          <MobileMessage icon={Hourglass} message={t("missionsEmpty")} />
        ) : (
          <ul className="space-y-3">
            {items.map((mission) => (
              <li key={mission.id}>
                <MissionCard mission={mission} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MobileTabTitle title={tNav("missions")} />
      {body}
    </div>
  );
}

function ProgressBar({
  value,
  height,
  color,
  label,
}: {
  value: number;
  height: number;
  color?: string;
  label?: string;
}) {
  const clamped = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className="block flex-1 overflow-hidden rounded-full bg-[#1e1e29]"
      style={{ height }}
    >
      <span
        className="block h-full rounded-full bg-gradient-to-br from-[#ffc83d] to-[#f5a524]"
        style={{ width: `${clamped * 100}%`, ...(color ? { background: color } : {}) }}
      />
    </span>
  );
}

function MissionsBanner({
  daily,
  missions,
  expiresAt,
}: {
  daily: boolean;
  missions: MissionDto[];
  expiresAt: string;
}) {
  const done = missions.filter(isCompleted).length;
  const bonus = missions.reduce((sum, m) => sum + m.rewardXp, 0);
  const { grouped, timeLeft } = useFormats();
  const remaining = timeLeft(expiresAt);
  const t = useTranslations("Gamification");

  return (
    <div className="flex items-center gap-3.5 rounded-[22px] border border-[#ffc83d]/35 bg-gradient-to-br from-[#3a2a0a] to-[#1c1626] p-[18px]">
      <div className="min-w-0 flex-1">
        <p className="text-base font-black text-white">
          {daily ? t("completeDaily") : t("completeWeekly")}
        </p>
        <p className="mt-1 text-xs text-[#9c9cb0]">
          {t("earnUpTo", { xp: grouped.format(bonus) })}
          {remaining ? ` · ${remaining}` : ""}
        </p>
        <div className="mt-3 flex items-center gap-2.5">
          <ProgressBar
            value={missions.length === 0 ? 0 : done / missions.length}
            height={8}
            label={t("missionsCompleted")}
          />
          <span className="text-sm font-extrabold text-[#ffc83d]">
            {done}/{missions.length}
          </span>
        </div>
      </div>
      <Gift className="size-14 shrink-0 text-[#ffc83d]" aria-hidden="true" />
    </div>
  );
}

function MissionCard({ mission }: { mission: MissionDto }) {
  const [Icon, color] = missionVisual(mission.requirementType);
  const { grouped } = useFormats();
  const t = useTranslations("Gamification");
  const completed = isCompleted(mission);
  const ratio = mission.target > 0 ? mission.progress / mission.target : 0;

  return (
    <div
      className="flex items-center gap-3 rounded-[18px] border bg-[#17171f] p-3.5"
      style={{ borderColor: completed ? "rgba(43,213,118,0.4)" : "#2a2a37" }}
    >
      <span
        className="grid size-11 shrink-0 place-items-center rounded-xl"
        style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 65%, black))` }}
      >
        <Icon className="size-[22px] text-white" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-white">{mission.title}</p>
        {mission.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-[#9c9cb0]">{mission.description}</p>
        ) : null}
        <div className="mt-2 flex items-center gap-2">
          <ProgressBar value={ratio} height={6} color={completed ? "#2bd576" : undefined} />
          <span className="text-[11px] text-[#9c9cb0]">
            {Math.min(Math.max(mission.progress, 0), mission.target)}/{mission.target}
          </span>
        </div>
      </div>
      {completed ? (
        <CheckCircle2 className="size-7 shrink-0 text-[#2bd576]" aria-label={t("completed")} />
      ) : (
        <span className="shrink-0 text-[13px] font-black text-[#ffc83d]">
          {t("xpReward", { xp: grouped.format(mission.rewardXp) })}
        </span>
      )}
    </div>
  );
}
