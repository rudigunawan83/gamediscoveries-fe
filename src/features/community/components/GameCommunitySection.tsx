"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  createCommunityPost,
  getGameDiscussions,
} from "@/lib/api/community";
import { analytics } from "@/lib/analytics/client";

export function GameCommunitySection({
  slug,
  gameId,
  gameTitle,
}: {
  slug: string;
  gameId: string;
  gameTitle: string;
}) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [sort, setSort] = useState("latest");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const discussionsQuery = useQuery({
    queryKey: ["community", "game", slug, sort],
    queryFn: async () => (await getGameDiscussions(slug, sort)).data ?? [],
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createCommunityPost({
        type: "discussion",
        title,
        content,
        gameId,
      }),
    onSuccess: async () => {
      analytics.track("community_post_created", {
        type: "discussion",
        gameId,
      });
      setTitle("");
      setContent("");
      setError(null);
      await queryClient.invalidateQueries({
        queryKey: ["community", "game", slug],
      });
    },
    onError: (err: Error) => setError(err.message || "Failed to create discussion"),
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">
          {gameTitle} Community
        </h1>
        <p className="text-sm text-muted-foreground">
          Game-centric discussions, tips, and player recommendations.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {[
          ["latest", "Latest"],
          ["popular", "Popular"],
          ["most_commented", "Most commented"],
        ].map(([value, label]) => (
          <Button
            key={value}
            size="sm"
            variant={sort === value ? "default" : "outline"}
            onClick={() => setSort(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {accessToken ? (
        <form
          className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <h2 className="font-display text-lg font-semibold text-white">
            Start a discussion
          </h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={160}
            placeholder="Is this game worth playing?"
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            maxLength={4000}
            rows={4}
            placeholder="Share your thoughts about this game..."
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <Button type="submit" disabled={createMutation.isPending}>
            Post discussion
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          Sign in to start a discussion about {gameTitle}.
        </p>
      )}

      <section className="space-y-3">
        {(discussionsQuery.data ?? []).map((post) => (
          <Link
            key={post.id}
            href={`/community/post/${post.id}`}
            className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:border-primary/40"
            onClick={() =>
              analytics.track("community_post_clicked", { postId: post.id })
            }
          >
            <p className="font-medium text-white">{post.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {post.content}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              @{post.author.username} · {post.commentCount} comments ·{" "}
              {post.reactionCount} reactions
            </p>
          </Link>
        ))}
        {!discussionsQuery.isPending &&
        (discussionsQuery.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">
            No discussions yet for this game.
          </p>
        ) : null}
      </section>
    </div>
  );
}
