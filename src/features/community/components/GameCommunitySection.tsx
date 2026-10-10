"use client";

import Link from "next/link";
import { useTranslations, type Messages } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { errorMessage } from "@/features/mobile-tabs/components/MobileCommunityUi";
import {
  createCommunityPost,
  getGameDiscussions,
} from "@/lib/api/community";
import { analytics } from "@/lib/analytics/client";

const SORTS = [
  ["latest", "sortLatest"],
  ["popular", "sortPopular"],
  ["most_commented", "sortMostCommented"],
] as const satisfies readonly (readonly [string, keyof Messages["Community"]])[];

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
  const t = useTranslations("Community");

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
    onError: (err: Error) => setError(errorMessage(err, t("createDiscussionFailed"))),
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">
          {t("gameCommunityTitle", { game: gameTitle })}
        </h1>
        <p className="text-sm text-muted-foreground">{t("gameCommunityIntro")}</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {SORTS.map(([value, label]) => (
          <Button
            key={value}
            size="sm"
            variant={sort === value ? "default" : "outline"}
            onClick={() => setSort(value)}
          >
            {t(label)}
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
            {t("startDiscussion")}
          </h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={160}
            placeholder={t("discussionTitleHint")}
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            maxLength={4000}
            rows={4}
            placeholder={t("discussionContentHint")}
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <Button type="submit" disabled={createMutation.isPending}>
            {t("postDiscussion")}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("signInToDiscuss", { game: gameTitle })}
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
              @{post.author.username} ·{" "}
              {t("postMeta", { comments: post.commentCount, reactions: post.reactionCount })}
            </p>
          </Link>
        ))}
        {!discussionsQuery.isPending &&
        (discussionsQuery.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("noDiscussions")}
          </p>
        ) : null}
      </section>
    </div>
  );
}
