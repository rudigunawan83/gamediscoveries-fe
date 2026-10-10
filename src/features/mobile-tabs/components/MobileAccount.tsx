"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronDown,
  Gamepad2,
  IdCard,
  LogOut,
  Mail,
  MessageSquareText,
  Star,
  Trash2,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  deleteReview,
  getMyReviews,
  getPrivacySettings,
  updatePrivacySetting,
  type MyReview,
  type PrivacyOption,
  type PrivacySettings,
} from "@/lib/api/community";
import { cn } from "@/lib/utils";
import { errorMessage } from "./MobileCommunityUi";
import { formatTimeAgo } from "./MobileGameDetail";
import { MobileSubpageHeader } from "./MobileSubpageHeader";
import { MobileMessage } from "./MobileTabUi";

const PRIVACY_KEY = ["me", "privacy"] as const;
const MY_REVIEWS_KEY = ["me", "reviews"] as const;

const card = "rounded-[18px] border border-[#2a2a37] bg-[#17171f]";

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[18px] border border-[#ff5d73]/40 bg-[#15151d] p-4">
      <p className="text-sm text-[#9c9cb0]">Something went wrong. Please try again.</p>
      <button type="button" onClick={onRetry} className="mt-2 text-sm font-bold text-[#ffc83d]">
        Try again
      </button>
    </div>
  );
}

function ConfirmSheet({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onCancel()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-w-xl rounded-t-[28px] border-[#2a2a37] bg-[#15151d] px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-5 text-white"
      >
        <SheetTitle className="text-lg font-extrabold text-white">{title}</SheetTitle>
        <SheetDescription className="text-sm text-[#9c9cb0]">{description}</SheetDescription>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-full px-4 text-sm font-bold text-[#ffc83d]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-full px-4 text-sm font-bold text-[#ff5d73]"
          >
            {confirmLabel}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const PRIVACY_LABELS: Record<PrivacyOption, [string, string]> = {
  showFavorites: ["Show favorites", "Others can see games you saved."],
  showHistory: ["Show play history", "Others can see what you played recently."],
  showAchievements: ["Show achievements", "Others can see badges you unlocked."],
  showActivity: ["Show activity", "Your activity appears in the community feed."],
  showOnLeaderboards: ["Show on leaderboards", "Your rank is visible on public leaderboards."],
};

function InfoTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <Icon className="size-6 shrink-0 text-[#ffc83d]" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[13px] text-[#9c9cb0]">{label}</p>
        <p className="truncate text-base font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function PrivacyCard() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: PRIVACY_KEY,
    queryFn: async () => (await getPrivacySettings()).data!,
  });
  const mutation = useMutation({
    mutationFn: ({ option, value }: { option: PrivacyOption; value: boolean }) =>
      updatePrivacySetting(option, value),
    onMutate: async ({ option, value }) => {
      await queryClient.cancelQueries({ queryKey: PRIVACY_KEY });
      const previous = queryClient.getQueryData<PrivacySettings>(PRIVACY_KEY);
      if (previous) queryClient.setQueryData(PRIVACY_KEY, { ...previous, [option]: value });
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(PRIVACY_KEY, context.previous);
      toast.error(errorMessage(error));
    },
  });

  if (query.isPending) {
    return <div className={cn(card, "h-[360px] animate-pulse")} aria-hidden="true" />;
  }
  if (query.isError) {
    return <LoadError onRetry={() => void query.refetch()} />;
  }

  const settings = query.data;
  return (
    <ul className={cn(card, "divide-y divide-[#2a2a37]")}>
      {(Object.keys(PRIVACY_LABELS) as PrivacyOption[]).map((option) => {
        const [title, description] = PRIVACY_LABELS[option];
        const checked = settings[option] ?? true;
        const id = `privacy-${option}`;
        return (
          <li key={option} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p id={id} className="font-bold text-white">
                {title}
              </p>
              <p className="text-sm text-[#9c9cb0]">{description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={checked}
              aria-labelledby={id}
              onClick={() => mutation.mutate({ option, value: !checked })}
              className={cn(
                "relative h-8 w-[52px] shrink-0 rounded-full border-2 transition-colors",
                checked ? "border-[#ffc83d] bg-[#ffc83d]" : "border-[#6b6b7e] bg-[#1e1e29]",
              )}
            >
              <span
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 rounded-full transition-all",
                  checked ? "left-[22px] size-6 bg-[#1a1205]" : "left-1 size-4 bg-[#6b6b7e]",
                )}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Mirrors the app's Account Settings screen. */
export function MobileAccountSettings() {
  const { accessToken, user, logout } = useAuth();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  return (
    <div className="pb-8">
      <MobileSubpageHeader title="Account Settings" />
      {!accessToken ? (
        <MobileMessage
          icon={UserCog}
          title="Manage your account"
          message="Sign in to view and manage your account."
          signIn
        />
      ) : (
        <div className="space-y-6">
          <div className={cn(card, "divide-y divide-[#2a2a37]")}>
            <InfoTile icon={IdCard} label="Display name" value={user?.displayName?.trim() || "—"} />
            <InfoTile icon={Mail} label="Email" value={user?.email || "—"} />
          </div>
          <section className="space-y-2.5">
            <h2 className="pl-1 text-sm font-bold text-[#9c9cb0]">Privacy</h2>
            <PrivacyCard />
          </section>
          <button
            type="button"
            onClick={() => setConfirmSignOut(true)}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-[#2a2a37] text-base font-bold text-[#ff5d73]"
          >
            <LogOut className="size-5" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      )}
      <ConfirmSheet
        open={confirmSignOut}
        title="Sign out?"
        description="Your progress stays saved on your account."
        confirmLabel="Sign Out"
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={() => {
          setConfirmSignOut(false);
          void logout();
        }}
      />
    </div>
  );
}

export const HELP_FAQS: readonly [string, string][] = [
  [
    "How do I earn XP?",
    "Play games, complete missions and unlock achievements while signed in. XP is awarded by our servers, so it may take a moment to show up in your profile.",
  ],
  [
    "Why didn't my progress save?",
    "XP, streaks, favorites and achievements are only saved to your account while you are signed in.",
  ],
  [
    "What are missions?",
    "Missions are challenges that refresh on a schedule. Open the Missions tab to see what is active and how much XP each one rewards.",
  ],
  [
    "A game won't load. What can I do?",
    "Games are provided by third-party publishers and need a stable internet connection. Go back and open the game again, or try another game.",
  ],
  ["How do I sign out?", "Open Account Settings from your profile and tap Sign Out."],
];

/** Mirrors the app's Help & Support screen. */
export function MobileHelp() {
  return (
    <div className="pb-8">
      <MobileSubpageHeader title="Help & Support" />
      <div className="space-y-2.5">
        {HELP_FAQS.map(([question, answer]) => (
          <details key={question} className={cn(card, "group overflow-hidden")}>
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 font-bold text-white [&::-webkit-details-marker]:hidden">
              <span className="flex-1">{question}</span>
              <ChevronDown
                className="size-5 shrink-0 text-[#9c9cb0] transition-transform group-open:rotate-180 group-open:text-[#ffc83d]"
                aria-hidden="true"
              />
            </summary>
            <p className="px-4 pb-4 text-sm leading-relaxed text-[#9c9cb0]">{answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review, onDelete }: { review: MyReview; onDelete: () => void }) {
  const slug = review.game?.slug ?? "";
  const title = review.game?.title ?? "";
  const thumb = review.game?.thumbnailUrl ?? "";
  const rating = Math.max(0, Math.min(5, Math.round(review.rating)));

  return (
    <article className="relative rounded-[18px] bg-[#17171f] py-3 pl-3 pr-1">
      {slug ? (
        <Link
          href={`/game/${encodeURIComponent(slug)}`}
          aria-label={`Open ${title}`}
          className="absolute inset-0 rounded-[18px]"
        />
      ) : null}
      <div className="flex items-center gap-3">
        <div className="relative h-[54px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-[#1e1e29]">
          {thumb ? (
            <Image src={thumb} alt="" fill sizes="72px" className="object-cover" />
          ) : (
            <Gamepad2 className="absolute inset-0 m-auto size-6 text-[#6b6b7e]" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-extrabold text-white">{title}</h3>
          <div className="mt-1 flex gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={cn("size-4 text-[#ffc83d]", index < rating && "fill-[#ffc83d]")}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-label="Delete review"
          onClick={onDelete}
          className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full text-[#9c9cb0]"
        >
          <Trash2 className="size-5" aria-hidden="true" />
        </button>
      </div>
      {review.content ? (
        <p className="mt-2.5 whitespace-pre-wrap pr-2 text-sm text-[#9c9cb0]">{review.content}</p>
      ) : null}
      <div className="mt-2 flex gap-2 text-xs">
        <span className="text-[#6b6b7e]">{formatTimeAgo(review.updatedAt || review.createdAt)}</span>
        {review.status === "hidden" ? (
          <span className="font-bold text-[#ff5d73]">Hidden by moderators</span>
        ) : null}
      </div>
    </article>
  );
}

/** Mirrors the app's My Reviews screen. */
export function MobileMyReviews() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<MyReview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const query = useQuery({
    queryKey: MY_REVIEWS_KEY,
    queryFn: async () => (await getMyReviews()).data ?? [],
    enabled: Boolean(accessToken),
  });
  const items = query.data ?? [];

  async function confirmDelete() {
    const review = toDelete;
    setConfirmOpen(false);
    if (!review) return;
    try {
      await deleteReview(review.id);
      await queryClient.invalidateQueries({ queryKey: MY_REVIEWS_KEY });
      toast.success("Review deleted");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <div className="pb-8">
      <MobileSubpageHeader title="My Reviews" />
      {!accessToken ? (
        <MobileMessage
          icon={MessageSquareText}
          title="Your reviews"
          message="Sign in to see and manage the reviews you wrote."
          signIn
        />
      ) : query.isPending ? (
        <div className="space-y-2.5" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-[120px] animate-pulse rounded-[18px] bg-[#17171f]" />
          ))}
        </div>
      ) : query.isError ? (
        <LoadError onRetry={() => void query.refetch()} />
      ) : items.length === 0 ? (
        <MobileMessage
          icon={MessageSquareText}
          title="No reviews yet"
          message="Play a game, then share what you think on its page."
          action={{ href: "/search", label: "Find a Game" }}
        />
      ) : (
        <ul className="space-y-2.5">
          {items.map((review) => (
            <li key={review.id}>
              <ReviewCard
                review={review}
                onDelete={() => {
                  setToDelete(review);
                  setConfirmOpen(true);
                }}
              />
            </li>
          ))}
        </ul>
      )}
      <ConfirmSheet
        open={confirmOpen}
        title="Delete review?"
        description={`Your review of ${toDelete?.game?.title || "this game"} will be removed.`}
        confirmLabel="Delete"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
