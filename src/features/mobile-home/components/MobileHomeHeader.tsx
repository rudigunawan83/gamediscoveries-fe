"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getNotifications } from "@/lib/api/community";
import { getMyProgress } from "@/lib/api/progress";

const grouped = new Intl.NumberFormat("en-US");

/** Greeting row from the app's Home tab: avatar, level progress and the notification bell. */
export function MobileHomeHeader() {
  const { accessToken, user } = useAuth();
  const signedIn = Boolean(accessToken);

  const progressQuery = useQuery({
    queryKey: ["me", "progress"],
    queryFn: async () => (await getMyProgress()).data!,
    enabled: signedIn,
  });

  const progress = signedIn ? progressQuery.data : undefined;
  const name = progress?.user.name || user?.displayName || "Player";
  const firstName = name.split(" ")[0];
  const avatarUrl = progress?.user.avatarUrl ?? user?.avatarUrl;
  const level = progress?.level;

  return (
    <div className="flex items-center gap-3 py-1">
      <Link
        href="/profile"
        aria-label="Profile"
        className="shrink-0 rounded-full p-0.5 ring-2 ring-primary"
      >
        <Avatar className="size-11">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-card font-bold text-white">
            {firstName.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-extrabold text-white">
          Hi, {firstName} 👋
        </p>
        {level ? (
          <Link href="/progress" className="mt-1 flex items-center gap-2">
            <span className="text-xs font-extrabold text-primary">
              Level {level.level}
            </span>
            <span
              role="progressbar"
              aria-label="Level progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(level.progressPercentage)}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
            >
              <span
                className="block h-full rounded-full bg-gradient-to-r from-[#ffc83d] to-[#f5a524]"
                style={{ width: `${Math.min(100, Math.max(0, level.progressPercentage))}%` }}
              />
            </span>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {level.isMaxLevel
                ? "MAX"
                : `${grouped.format(level.currentLevelXp)} / ${grouped.format(level.nextLevelXp)} XP`}
            </span>
          </Link>
        ) : signedIn ? null : (
          <Link href="/login" className="mt-1 block text-xs font-semibold text-primary">
            Sign in to earn XP &amp; level up
          </Link>
        )}
      </div>

      <MobileNotificationBell />
    </div>
  );
}

/** Bell with the unread badge, as in the app's Home and Leaderboard app bars. */
export function MobileNotificationBell() {
  const { accessToken } = useAuth();
  const signedIn = Boolean(accessToken);
  const notificationsQuery = useQuery({
    queryKey: ["community", "notifications"],
    queryFn: async () => (await getNotifications()).data,
    enabled: signedIn,
  });
  const unread = signedIn ? (notificationsQuery.data?.unread ?? 0) : 0;

  return (
    <Link
      href="/community/notifications"
      aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
      className="relative grid size-11 shrink-0 place-items-center rounded-full text-white hover:bg-white/5"
    >
      <Bell className="size-6" aria-hidden="true" />
      {unread > 0 ? (
        <span className="absolute right-1 top-1 min-w-4 rounded-full bg-[#ff5d73] px-1 text-center text-[10px] font-bold leading-4 text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
