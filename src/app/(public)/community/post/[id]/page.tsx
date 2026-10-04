"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  createComment,
  getCommunityPost,
  getPostComments,
  setReaction,
} from "@/lib/api/community";
import { analytics } from "@/lib/analytics/client";
import { useEffect } from "react";

export default function CommunityPostPage() {
  const params = useParams<{ id: string }>();
  const postId = params.id;
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const postQuery = useQuery({
    queryKey: ["community", "post", postId],
    queryFn: async () => (await getCommunityPost(postId)).data,
  });

  const commentsQuery = useQuery({
    queryKey: ["community", "comments", postId],
    queryFn: async () => (await getPostComments(postId)).data ?? [],
  });

  useEffect(() => {
    if (postQuery.data) {
      analytics.track("community_post_viewed", { postId });
    }
  }, [postId, postQuery.data]);

  const commentMutation = useMutation({
    mutationFn: () => createComment(postId, comment),
    onSuccess: async () => {
      analytics.track("community_comment_created", { postId });
      setComment("");
      await queryClient.invalidateQueries({
        queryKey: ["community", "comments", postId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["community", "post", postId],
      });
    },
  });

  const post = postQuery.data;
  if (postQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Loading post…</p>;
  }
  if (!post) {
    return <p className="text-sm text-muted-foreground">Post not found.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <article className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {post.type}
          </p>
          <h1 className="font-display text-3xl font-bold text-white">
            {post.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            by{" "}
            <Link
              href={`/profile/${post.author.username}`}
              className="text-primary"
            >
              @{post.author.username}
            </Link>
            {post.game ? (
              <>
                {" "}
                ·{" "}
                <Link href={`/game/${post.game.slug}`} className="text-primary">
                  {post.game.title}
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">
          {post.content}
        </p>
        <div className="flex flex-wrap gap-2">
          {["like", "helpful", "love", "funny"].map((reaction) => (
            <Button
              key={reaction}
              size="sm"
              variant="outline"
              disabled={!accessToken}
              onClick={() => {
                void setReaction("post", post.id, reaction).then(() => {
                  analytics.track("community_reaction_added", {
                    postId,
                    reaction,
                  });
                  return queryClient.invalidateQueries({
                    queryKey: ["community", "post", postId],
                  });
                });
              }}
            >
              {reaction}
            </Button>
          ))}
          <span className="self-center text-xs text-muted-foreground">
            {post.reactionCount} reactions · {post.commentCount} comments
          </span>
        </div>
      </article>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-white">
          Comments
        </h2>
        {accessToken ? (
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!comment.trim()) return;
              commentMutation.mutate();
            }}
          >
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              placeholder="Add a comment"
            />
            <Button type="submit" disabled={commentMutation.isPending}>
              Comment
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">Sign in to comment.</p>
        )}

        <div className="space-y-3">
          {(commentsQuery.data ?? []).map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <p className="text-xs text-muted-foreground">
                @{item.author.username}
              </p>
              <p className="mt-1 text-sm text-white">{item.content}</p>
              <div className="mt-2 space-y-2 pl-4">
                {item.replies.map((reply) => (
                  <div key={reply.id} className="text-sm text-white/90">
                    <span className="text-xs text-muted-foreground">
                      @{reply.author.username}:{" "}
                    </span>
                    {reply.content}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
