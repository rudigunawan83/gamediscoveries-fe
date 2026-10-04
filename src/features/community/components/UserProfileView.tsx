"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  blockUser,
  followUser,
  getUserProfile,
  unfollowUser,
} from "@/lib/api/community";
import { analytics } from "@/lib/analytics/client";

export function UserProfileView({ username }: { username: string }) {
  const { accessToken, user } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["community", "profile", username],
    queryFn: async () => (await getUserProfile(username)).data,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["community", "profile", username],
    });

  const followMutation = useMutation({
    mutationFn: async () => {
      const profile = profileQuery.data;
      if (!profile) return;
      if (profile.isFollowing) {
        await unfollowUser(profile.id);
        analytics.track("community_user_unfollowed", { userId: profile.id });
      } else {
        await followUser(profile.id);
        analytics.track("community_user_followed", { userId: profile.id });
      }
    },
    onSuccess: () => void invalidate(),
  });

  const blockMutation = useMutation({
    mutationFn: async () => {
      const profile = profileQuery.data;
      if (!profile) return;
      await blockUser(profile.id);
    },
    onSuccess: () => void invalidate(),
  });

  if (profileQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Loading profile…</p>;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <p className="text-sm text-muted-foreground">
        Profile not found or private.
      </p>
    );
  }

  const profile = profileQuery.data;
  const isSelf = user?.id === profile.id;

  return (
    <div className="space-y-8">
      <header className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              {profile.displayName || profile.username}
            </h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {profile.bio ? (
              <p className="mt-3 max-w-2xl text-sm text-white/90">{profile.bio}</p>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground">
              Joined {new Date(profile.joinedAt).toLocaleDateString()}
            </p>
          </div>
          {accessToken && !isSelf ? (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
              >
                {profile.isFollowing ? "Unfollow" : "Follow"}
              </Button>
              <Button
                variant="outline"
                onClick={() => blockMutation.mutate()}
                disabled={blockMutation.isPending}
              >
                Block
              </Button>
            </div>
          ) : null}
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Games Played", profile.gamesPlayed],
            ["Favorites", profile.favorites],
            ["Achievements", profile.achievements],
            ["Reviews", profile.reviews],
          ].map(([label, value]) => (
            <div
              key={label as string}
              className="rounded-lg border border-white/10 bg-black/20 p-3"
            >
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-lg font-semibold text-white">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground">
          {profile.followers} followers · {profile.following} following
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-white">
          Favorite Games
        </h2>
        <div className="flex flex-wrap gap-3">
          {profile.favoriteGames.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.slug}`}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:border-primary/40"
            >
              {game.title}
            </Link>
          ))}
          {profile.favoriteGames.length === 0 ? (
            <p className="text-sm text-muted-foreground">No favorites shown.</p>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-white">
          Achievements
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {profile.recentAchievements.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <p className="text-sm font-medium text-white">
                {item.icon} {item.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
          {profile.recentAchievements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No achievements shown.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
