"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { errorMessage } from "@/features/mobile-tabs/components/MobileCommunityUi";
import { upsertGameReview } from "@/lib/api/community";
import { analytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const REVIEW_MAX_LENGTH = 2000;

export function MobileReviewComposer({ slug }: { slug: string }) {
  const t = useTranslations("Game");
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => upsertGameReview(slug, rating, content.trim()),
    onSuccess: async () => {
      analytics.track("community_review_created", { gameSlug: slug, rating });
      setContent("");
      setError(null);
      toast.success(t("reviewSaved"));
      await queryClient.invalidateQueries({ queryKey: ["community", "reviews", slug] });
      await queryClient.invalidateQueries({ queryKey: ["me", "reviews"] });
    },
    onError: (err: Error) => setError(errorMessage(err, t("saveReviewFailed"))),
  });

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-[#9c9cb0]">
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/game/${slug}`)}`}
          className="font-bold text-[#ffc83d]"
        >
          {t("signInToReview")}
        </Link>
      </p>
    );
  }

  return (
    <form
      className="rounded-2xl bg-[#17171f] p-3.5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!content.trim() || mutation.isPending) return;
        mutation.mutate();
      }}
    >
      <p className="text-sm font-bold text-white">{t("yourRating")}</p>
      <div className="mt-1 flex" role="radiogroup" aria-label={t("yourRating")}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={t("starsLabel", { rating: value })}
            onClick={() => setRating(value)}
            className="grid size-9 place-items-center"
          >
            <Star
              aria-hidden="true"
              className={cn("size-6 text-[#ffc83d]", value <= rating && "fill-[#ffc83d]")}
            />
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={3}
        maxLength={REVIEW_MAX_LENGTH}
        required
        placeholder={t("reviewHint")}
        className="mt-2 w-full resize-none rounded-xl border border-[#2a2a37] bg-[#0b0b10] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6b6b7e]"
      />
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={!content.trim() || mutation.isPending}
        className="mt-3 h-11 w-full rounded-2xl bg-[#ffc83d] text-sm font-extrabold text-[#1a1205] disabled:bg-[#1e1e29] disabled:text-[#6b6b7e]"
      >
        {mutation.isPending ? t("savingReview") : t("submitReview")}
      </button>
    </form>
  );
}
