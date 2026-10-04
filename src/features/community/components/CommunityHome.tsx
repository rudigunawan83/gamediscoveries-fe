"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CreatePostForm } from "@/features/community/components/CreatePostForm";
import { getCommunityHome } from "@/lib/api/community";
import { analytics } from "@/lib/analytics/client";
import { useEffect } from "react";

export function CommunityHome() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["community", "home"],
    queryFn: async () => (await getCommunityHome()).data,
    staleTime: 30_000,
  });

  useEffect(() => {
    analytics.track("community_viewed", { source: "community_home" });
  }, []);

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading community…</p>;
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

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <CreatePostForm onCreated={() => void refetch()} />

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-white">
            Community Feed
          </h2>
          <div className="space-y-3">
            {data.feed.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm text-white">{item.message}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <Link
                    href={`/profile/${item.user.username}`}
                    className="hover:text-primary"
                  >
                    @{item.user.username}
                  </Link>
                  {item.game ? (
                    <Link
                      href={`/game/${item.game.slug}`}
                      className="hover:text-primary"
                    >
                      {item.game.title}
                    </Link>
                  ) : null}
                  {item.entityType === "post" && item.entityId ? (
                    <Link
                      href={`/community/post/${item.entityId}`}
                      className="hover:text-primary"
                    >
                      Open post
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
            {data.feed.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No community activity yet. Start a discussion!
              </p>
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-white">
            Trending Discussions
          </h2>
          <div className="space-y-3">
            {data.trendingDiscussions.map((post) => (
              <Link
                key={post.id}
                href={`/community/post/${post.id}`}
                className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:border-primary/40"
              >
                <p className="font-medium text-white">{post.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {post.content}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {post.commentCount} comments · {post.reactionCount} reactions
                  {post.game ? ` · ${post.game.title}` : ""}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-8">
        <section className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-white">
            Active Challenges
          </h3>
          {data.activeChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <p className="text-sm font-medium text-white">{challenge.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {challenge.description}
              </p>
              <p className="mt-2 text-xs text-primary">
                Progress {challenge.progress}/{challenge.targetValue}
              </p>
            </div>
          ))}
          <Link href="/community/challenges" className="text-xs text-primary">
            View all challenges
          </Link>
        </section>

        <section className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-white">
            Top Players
          </h3>
          <ol className="space-y-2">
            {data.topPlayers.map((player) => (
              <li
                key={player.userId}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  href={`/profile/${player.username}`}
                  className="text-white hover:text-primary"
                >
                  {player.rank}. {player.displayName || player.username}
                </Link>
                <span className="text-muted-foreground">{player.score}</span>
              </li>
            ))}
          </ol>
          <Link href="/community/leaderboards" className="text-xs text-primary">
            Full leaderboards
          </Link>
        </section>

        <section className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-white">
            Popular in Community
          </h3>
          {data.popularGames.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.slug}/community`}
              className="block text-sm text-white hover:text-primary"
            >
              {game.title}
            </Link>
          ))}
        </section>
      </aside>
    </div>
  );
}
