"use client";

import Link from "next/link";
import { Award, Flame, Target, Trophy, Users, Zap } from "lucide-react";
import {
  BarChart,
  ChartLegend,
  Donut,
  LabeledBarChart,
  StackedBarChart,
} from "@/features/admin-monitoring/components/MonitoringCharts";
import {
  Change,
  CountCard,
  Empty,
  MonitoringFrame,
  Panel,
  PanelLink,
  previousLabel,
} from "@/features/admin-monitoring/components/MonitoringUi";
import { formatAgo, isHourlyMonitoring } from "@/features/admin-monitoring/monitoringFormat";
import {
  getMonitoringGamification,
  type GamificationShare,
  type MonitoringGamification,
  type MonitoringRange,
} from "@/lib/api/monitoring";
import { cn } from "@/lib/utils";

const colors = { xp: "#f5c542", players: "#5b8def", daily: "#f5c542", weekly: "#5b8def" };

const difficultyLabels: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  EPIC: "Epic",
  LEGENDARY: "Legendary",
};

const difficultyBadges: Record<string, string> = {
  EASY: "bg-[#3dd68c]/15 text-[#3dd68c]",
  MEDIUM: "bg-[#5b8def]/15 text-[#5b8def]",
  HARD: "bg-[#ff8a5b]/15 text-[#ff8a5b]",
  EPIC: "bg-[#b57bff]/15 text-[#b57bff]",
  LEGENDARY: "bg-[#f5c542]/15 text-[#f5c542]",
};

const levelLabels: Record<string, string> = {
  "1_5": "1–5",
  "6_10": "6–10",
  "11_15": "11–15",
  "16_20": "16–20",
  "21_30": "21–30",
  "31_50": "31–50",
  "51_plus": "51+",
};

const streakLabels: Record<string, string> = {
  "1_3": "1–3 days",
  "4_7": "4–7 days",
  "8_14": "8–14 days",
  "15_30": "15–30 days",
  "31_plus": "31+ days",
};

const missionStateLabels: Record<string, string> = {
  completed: "Completed",
  inProgress: "In Progress",
  notStarted: "Not Started",
  expired: "Expired",
};

const xpSourceLabels: Record<string, string> = {
  GAME_SESSION_END: "Gameplay",
  FAVORITE_ADDED: "Favorite",
  ACHIEVEMENT_UNLOCK: "Achievement",
  ACHIEVEMENT_UNLOCKED: "Achievement",
  DAILY_MISSION_COMPLETED: "Daily Mission",
  WEEKLY_CHALLENGE_COMPLETED: "Weekly Challenge",
  STREAK_MILESTONE: "Streak",
  RATING_CREATED: "Rating",
  REVIEW_CREATED: "Review",
  GAME_SHARED: "Share",
};

function humanize(value: string) {
  const text = value.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function toShares(shares: GamificationShare[]) {
  return shares.map((share) => ({ key: share.key, sessions: share.count }));
}

function total(shares: GamificationShare[]) {
  return shares.reduce((sum, share) => sum + share.count, 0);
}

export function MonitoringGamificationView() {
  return (
    <MonitoringFrame
      queryName="gamification"
      path="/admin/monitoring/gamification"
      title="Gamification Analytics"
      description="XP, missions, achievements, levels, and streaks from real players. Seeded demo accounts are excluded."
      icon={Trophy}
      load={getMonitoringGamification}
    >
      {(data, range) => <GamificationData data={data} range={range} />}
    </MonitoringFrame>
  );
}

function GamificationData({ data, range }: { data: MonitoringGamification; range: MonitoringRange }) {
  const hourly = isHourlyMonitoring(data);
  const vs = previousLabel(range);
  const buckets = data.trend.map((point) => point.bucket);
  const xp = data.trend.map((point) => point.xp);
  const players = data.trend.map((point) => point.players);
  const daily = data.trend.map((point) => point.dailyMissions);
  const weekly = data.trend.map((point) => point.weeklyMissions);
  const missions = data.trend.map((point) => point.dailyMissions + point.weeklyMissions);
  const achievements = data.trend.map((point) => point.achievements);
  const hasXp = xp.some((value) => value > 0);
  const hasMissions = missions.some((value) => value > 0);
  const hasAchievements = achievements.some((value) => value > 0);
  const { missionRate } = data;
  const missionTotal = missionRate.completed + missionRate.inProgress + missionRate.notStarted + missionRate.expired;

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <CountCard label="Total XP Awarded" hint={vs} icon={Zap} metric={data.xpAwarded} trend={hasXp ? xp : undefined} />
        <CountCard
          label="Active Players (with XP)"
          hint={vs}
          icon={Users}
          metric={data.activePlayers}
          trend={hasXp ? players : undefined}
          color={colors.players}
        />
        <CountCard
          label="Mission Completions"
          hint={vs}
          icon={Target}
          metric={data.missionCompletions}
          trend={hasMissions ? missions : undefined}
        />
        <CountCard
          label="Achievements Unlocked"
          hint={vs}
          icon={Award}
          metric={data.achievementsUnlocked}
          trend={hasAchievements ? achievements : undefined}
        />
        <CountCard label="Active Streaks" hint="Current, not by range" icon={Flame} metric={data.activeStreaks} />
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel title="XP Awarded Trend" subtitle="Positive XP awarded per period">
          {hasXp ? (
            <BarChart buckets={buckets} values={xp} hourly={hourly} label="XP awarded over time" color={colors.xp} />
          ) : (
            <Empty text="No XP was awarded in this range." />
          )}
        </Panel>
        <Panel
          title="Mission Completions"
          subtitle="Completed daily missions and weekly challenges"
          action={
            <ChartLegend
              series={[
                { label: "Daily", color: colors.daily },
                { label: "Weekly", color: colors.weekly },
              ]}
            />
          }
        >
          {hasMissions ? (
            <StackedBarChart
              buckets={buckets}
              hourly={hourly}
              label="Mission completions over time"
              series={[
                { label: "Daily", color: colors.daily, values: daily },
                { label: "Weekly", color: colors.weekly, values: weekly },
              ]}
            />
          ) : (
            <Empty text="No missions were completed in this range." />
          )}
        </Panel>
        <Panel title="Achievement Unlocks" subtitle="Unlocks in this range by difficulty">
          {total(data.achievementsByDifficulty) === 0 ? (
            <Empty text="No achievements were unlocked in this range." />
          ) : (
            <Donut
              shares={toShares(data.achievementsByDifficulty)}
              label={(key) => difficultyLabels[key] ?? key}
              centerLabel="Total Unlocks"
            />
          )}
        </Panel>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel title="Level Distribution" subtitle="All players by current level">
          {total(data.levels) === 0 ? (
            <Empty text="No players have progress yet." />
          ) : (
            <LabeledBarChart
              label="Players by level"
              items={data.levels.map((share) => ({
                key: share.key,
                label: levelLabels[share.key] ?? share.key,
                value: share.count,
              }))}
            />
          )}
        </Panel>
        <Panel title="Active Streaks" subtitle="Current streak length of players with an active streak">
          {total(data.streaks) === 0 ? (
            <Empty text="No player has an active streak right now." />
          ) : (
            <Donut
              shares={toShares(data.streaks)}
              label={(key) => streakLabels[key] ?? key}
              centerLabel="Active Streaks"
            />
          )}
        </Panel>
        <Panel title="Mission Completion Rate" subtitle="Missions open at any time in this range">
          {missionTotal === 0 ? (
            <Empty text="No missions were assigned in this range." />
          ) : (
            <Donut
              shares={[
                { key: "completed", sessions: missionRate.completed },
                { key: "inProgress", sessions: missionRate.inProgress },
                { key: "notStarted", sessions: missionRate.notStarted },
                { key: "expired", sessions: missionRate.expired },
              ]}
              label={(key) => missionStateLabels[key] ?? key}
              centerLabel="Completion Rate"
              centerValue={missionRate.completionRate == null ? "—" : `${missionRate.completionRate.toFixed(1)}%`}
            />
          )}
        </Panel>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel
          title="Top Players by XP"
          subtitle="XP earned in this range"
          action={<PanelLink href="/admin/gamification/users">View all</PanelLink>}
        >
          {data.topPlayers.length === 0 ? (
            <Empty text="No player earned XP in this range." />
          ) : (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-xs text-[#8b8ca3]">
                  <th className="w-6 pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Player</th>
                  <th className="w-12 pb-2 text-right font-medium">Level</th>
                  <th className="w-16 pb-2 text-right font-medium">XP</th>
                  <th className="w-16 pb-2 text-right font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {data.topPlayers.map((player, index) => (
                  <tr key={player.userId} className="border-t border-white/5">
                    <td className="py-2 text-[#8b8ca3]">{index + 1}</td>
                    <td className="py-2">
                      <PlayerLink userId={player.userId} name={player.player} />
                    </td>
                    <td className="py-2 text-right tabular-nums text-[#c7c8d6]">Lv {player.level}</td>
                    <td className="py-2 text-right tabular-nums">{player.xp.toLocaleString("en")}</td>
                    <td className="py-2 text-right">
                      <Change value={player.changePercent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel
          title="Top Missions by Completions"
          subtitle="Missions open in this range"
          action={<PanelLink href="/admin/gamification/missions">View all</PanelLink>}
        >
          {data.topMissions.length === 0 ? (
            <Empty text="No missions were assigned in this range." />
          ) : (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-xs text-[#8b8ca3]">
                  <th className="w-6 pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Mission</th>
                  <th className="w-16 pb-2 text-right font-medium">Done</th>
                  <th className="w-28 pb-2 pl-3 font-medium">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.topMissions.map((mission, index) => (
                  <tr key={`${mission.type}-${mission.title}`} className="border-t border-white/5">
                    <td className="py-2 text-[#8b8ca3]">{index + 1}</td>
                    <td className="py-2">
                      <span className="block truncate font-semibold" title={mission.title}>
                        {mission.title}
                      </span>
                      <span className="text-[10px] text-[#8b8ca3]">{humanize(mission.type)}</span>
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {mission.completed.toLocaleString("en")}
                      <span className="text-[#8b8ca3]">/{mission.assigned.toLocaleString("en")}</span>
                    </td>
                    <td className="py-2 pl-3">
                      <span className="flex items-center gap-2">
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#07080f]">
                          <span
                            className="block h-full rounded-full bg-[#f5c542]"
                            style={{ width: `${mission.completionRate ?? 0}%` }}
                          />
                        </span>
                        <span className="w-10 text-right text-xs tabular-nums text-[#c7c8d6]">
                          {mission.completionRate == null ? "—" : `${mission.completionRate.toFixed(1)}%`}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel
          title="Top Achievements"
          subtitle="Unlocks in this range"
          action={<PanelLink href="/admin/gamification/achievements">View all</PanelLink>}
        >
          {data.topAchievements.length === 0 ? (
            <Empty text="No achievements were unlocked in this range." />
          ) : (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-xs text-[#8b8ca3]">
                  <th className="w-6 pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Achievement</th>
                  <th className="w-16 pb-2 text-right font-medium">Unlocks</th>
                  <th className="w-24 pb-2 text-right font-medium">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {data.topAchievements.map((achievement, index) => (
                  <tr key={achievement.title} className="border-t border-white/5">
                    <td className="py-2 text-[#8b8ca3]">{index + 1}</td>
                    <td className="truncate py-2 font-semibold" title={achievement.title}>
                      {achievement.title}
                    </td>
                    <td className="py-2 text-right tabular-nums">{achievement.unlocks.toLocaleString("en")}</td>
                    <td className="py-2 text-right">
                      <DifficultyBadge difficulty={achievement.difficulty} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel title="XP Transaction History" subtitle="Latest XP changes">
          {data.recentXp.length === 0 ? (
            <Empty text="No XP transactions yet." />
          ) : (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-xs text-[#8b8ca3]">
                  <th className="w-20 pb-2 font-medium">Time</th>
                  <th className="w-24 pb-2 font-medium">Player</th>
                  <th className="pb-2 font-medium">Action</th>
                  <th className="w-12 pb-2 text-right font-medium">XP</th>
                </tr>
              </thead>
              <tbody>
                {data.recentXp.map((entry, index) => (
                  <tr key={`${entry.at}-${index}`} className="border-t border-white/5">
                    <td className="py-2 text-xs text-[#8b8ca3]">{formatAgo(entry.at)}</td>
                    <td className="py-2">
                      <PlayerLink userId={entry.userId} name={entry.player} />
                    </td>
                    <td className="py-2">
                      <span className="block truncate" title={entry.description}>
                        {entry.description}
                      </span>
                      <span className="text-[10px] text-[#8b8ca3]">
                        {xpSourceLabels[entry.source] ?? humanize(entry.source)}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "py-2 text-right font-semibold tabular-nums",
                        entry.xp >= 0 ? "text-[#3dd68c]" : "text-[#ff6b6b]",
                      )}
                    >
                      {entry.xp >= 0 ? "+" : ""}
                      {entry.xp.toLocaleString("en")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel title="Recent Achievements" subtitle="Latest unlocks">
          {data.recentAchievements.length === 0 ? (
            <Empty text="No achievements unlocked yet." />
          ) : (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-xs text-[#8b8ca3]">
                  <th className="w-20 pb-2 font-medium">Time</th>
                  <th className="w-24 pb-2 font-medium">Player</th>
                  <th className="pb-2 font-medium">Achievement</th>
                  <th className="w-24 pb-2 text-right font-medium">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAchievements.map((entry, index) => (
                  <tr key={`${entry.at}-${index}`} className="border-t border-white/5">
                    <td className="py-2 text-xs text-[#8b8ca3]">{formatAgo(entry.at)}</td>
                    <td className="py-2">
                      <PlayerLink userId={entry.userId} name={entry.player} />
                    </td>
                    <td className="truncate py-2" title={entry.achievement}>
                      {entry.achievement}
                    </td>
                    <td className="py-2 text-right">
                      <DifficultyBadge difficulty={entry.difficulty} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel title="Recent Mission Completions" subtitle="Latest completed missions">
          {data.recentMissions.length === 0 ? (
            <Empty text="No missions completed yet." />
          ) : (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-xs text-[#8b8ca3]">
                  <th className="w-20 pb-2 font-medium">Time</th>
                  <th className="w-24 pb-2 font-medium">Player</th>
                  <th className="pb-2 font-medium">Mission</th>
                  <th className="w-12 pb-2 text-right font-medium">XP</th>
                </tr>
              </thead>
              <tbody>
                {data.recentMissions.map((entry, index) => (
                  <tr key={`${entry.at}-${index}`} className="border-t border-white/5">
                    <td className="py-2 text-xs text-[#8b8ca3]">{formatAgo(entry.at)}</td>
                    <td className="py-2">
                      <PlayerLink userId={entry.userId} name={entry.player} />
                    </td>
                    <td className="py-2">
                      <span className="block truncate" title={entry.mission}>
                        {entry.mission}
                      </span>
                      <span className="text-[10px] text-[#8b8ca3]">{humanize(entry.type)}</span>
                    </td>
                    <td className="py-2 text-right font-semibold tabular-nums text-[#3dd68c]">
                      +{entry.rewardXp.toLocaleString("en")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </section>

      <p className="text-xs text-[#8b8ca3]">
        Seeded demo accounts are excluded. Generated {new Date(data.generatedAt).toLocaleString("en")}. Cached for about
        5 minutes. Refresh bypasses the cache.
      </p>
    </>
  );
}

function PlayerLink({ userId, name }: { userId: string; name: string }) {
  return (
    <Link
      href={`/admin/gamification/users/${userId}`}
      className="block truncate font-semibold hover:underline"
      title={name}
    >
      {name}
    </Link>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
        difficultyBadges[difficulty] ?? "bg-white/10 text-[#c7c8d6]",
      )}
    >
      {difficultyLabels[difficulty] ?? humanize(difficulty)}
    </span>
  );
}
