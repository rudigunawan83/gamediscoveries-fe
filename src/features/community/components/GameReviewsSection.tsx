"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getGameReviews, upsertGameReview } from "@/lib/api/community";
import { analytics } from "@/lib/analytics/client";

export function GameReviewsSection({ slug }: { slug: string }) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reviewsQuery = useQuery({
    queryKey: ["community", "reviews", slug],
    queryFn: async () => (await getGameReviews(slug)).data,
  });

  const mutation = useMutation({
    mutationFn: () => upsertGameReview(slug, rating, content),
    onSuccess: async () => {
      analytics.track("community_review_created", { gameSlug: slug, rating });
      setContent("");
      setError(null);
      await queryClient.invalidateQueries({
        queryKey: ["community", "reviews", slug],
      });
    },
    onError: (err: Error) => setError(err.message || "Failed to save review"),
  });

  const summary = reviewsQuery.data?.summary;
  const items = reviewsQuery.data?.items ?? [];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">
            Community Reviews
          </h2>
          {summary ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="size-4 fill-warning text-warning" aria-hidden />
              {summary.averageRating.toFixed(1)} / 5 · {summary.reviewCount}{" "}
              reviews
            </p>
          ) : null}
        </div>
      </div>

      {accessToken ? (
        <form
          className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!content.trim()) return;
            mutation.mutate();
          }}
        >
          <label className="block text-sm text-muted-foreground">
            Your rating
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} stars
                </option>
              ))}
            </select>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={2000}
            required
            placeholder="What did you think about this game?"
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Submit review"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">Sign in to write a review.</p>
      )}

      <div className="space-y-3">
        {items.map((review) => (
          <article
            key={review.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>@{review.author.username}</span>
              <span className="inline-flex items-center gap-1">
                <Star className="size-3 fill-warning text-warning" />
                {review.rating}/5
              </span>
            </div>
            <p className="mt-2 text-sm text-white/90">{review.content}</p>
          </article>
        ))}
        {!reviewsQuery.isPending && items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : null}
      </div>
    </section>
  );
}
