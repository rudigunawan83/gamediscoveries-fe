"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, type Messages } from "next-intl";
import { useQueryClient, type InfiniteData, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  Bookmark,
  BookmarkMinus,
  BookmarkPlus,
  Flag,
  Gamepad2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  createCommunityPost,
  createReport,
  deleteCommunityPost,
  removeReaction,
  setReaction,
  type CommunityPost,
  type CommunityUser,
} from "@/lib/api/community";
import { REQUEST_FAILED_MESSAGE } from "@/lib/api/client";
import { ApiClientError } from "@/lib/api/types";
import { useFormats } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import { toggleSavedPost, useSavedPosts } from "../lib/savedCommunityPosts";
import { MobilePillTabs } from "./MobileTabUi";

export const COMMUNITY_POSTS_KEY = ["community", "posts"] as const;

export type CommunityTranslator = (
  key: keyof Messages["Community"],
  values?: Record<string, string | number>,
) => string;

export function errorMessage(error: unknown, fallback: string) {
  if (
    error instanceof ApiClientError &&
    (error.status === 0 || error.status === 408 || error.message === REQUEST_FAILED_MESSAGE)
  ) {
    return fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

/** {@link errorMessage} with the localized generic fallback. */
export function useErrorMessage() {
  const t = useTranslations("Common");
  return useCallback((error: unknown) => errorMessage(error, t("errorGeneric")), [t]);
}

export function communityName(user: CommunityUser) {
  return user.displayName?.trim() ? user.displayName : user.username;
}

/** The section a post lives in, e.g. "Discussions". */
export function sectionLabel(t: CommunityTranslator, type?: string | null) {
  switch (type) {
    case "discussion":
      return t("sectionDiscussions");
    case "question":
      return t("sectionQuestions");
    case "recommendation":
      return t("sectionRecommendations");
    case "game_share":
      return t("sectionGameShares");
    case "achievement_share":
      return t("sectionAchievements");
    default: {
      const raw = (type ?? "").replaceAll("_", " ").toLowerCase();
      return raw ? raw[0]!.toUpperCase() + raw.slice(1) : "";
    }
  }
}

export function withReaction(post: CommunityPost, reaction: string | null): CommunityPost {
  const delta = (reaction ? 1 : 0) - (post.viewerReaction ? 1 : 0);
  return {
    ...post,
    viewerReaction: reaction,
    reactionCount: Math.max(0, post.reactionCount + delta),
  };
}

type PostsPage = { items: CommunityPost[]; nextCursor?: string | null };

function patchPost(queryClient: QueryClient, id: string, update: (post: CommunityPost) => CommunityPost) {
  queryClient.setQueriesData<InfiniteData<PostsPage>>({ queryKey: COMMUNITY_POSTS_KEY }, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((item) => (item.id === id ? update(item) : item)),
          })),
        }
      : data,
  );
  queryClient.setQueryData<CommunityPost>(["community", "post", id], (post) => (post ? update(post) : post));
}

/** Snackbar with a "Sign In" action, like the app's sign-in prompt. */
export function useSignInPrompt() {
  const router = useRouter();
  const t = useTranslations("Common");
  return useCallback(
    (message: string) =>
      toast(message, { action: { label: t("signIn"), onClick: () => router.push("/login") } }),
    [router, t],
  );
}

/** Optimistic like toggle; rolls back when the API call fails. */
export function useLikePost() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const promptSignIn = useSignInPrompt();
  const toErrorMessage = useErrorMessage();
  const t = useTranslations("Community");
  const pending = useRef(new Set<string>());

  return useCallback(
    async (post: CommunityPost) => {
      if (!accessToken) {
        promptSignIn(t("signInToLike"));
        return;
      }
      if (pending.current.has(post.id)) return;
      pending.current.add(post.id);

      const liked = Boolean(post.viewerReaction);
      patchPost(queryClient, post.id, (item) => withReaction(item, liked ? null : "like"));
      try {
        if (liked) await removeReaction("post", post.id);
        else await setReaction("post", post.id, "like");
      } catch (error) {
        patchPost(queryClient, post.id, (item) => withReaction(item, liked ? "like" : null));
        toast.error(toErrorMessage(error));
      } finally {
        pending.current.delete(post.id);
      }
    },
    [accessToken, promptSignIn, queryClient, t, toErrorMessage],
  );
}

export function useToggleSaved() {
  const t = useTranslations("Community");
  return useCallback(
    (post: CommunityPost) => {
      toast(toggleSavedPost(post) ? t("savedToPosts") : t("removedFromSaved"));
    },
    [t],
  );
}

export function useSharePost() {
  const t = useTranslations("Community");
  const tCommon = useTranslations("Common");
  return useCallback(
    async (post: CommunityPost) => {
      const url = `${window.location.origin}/community/post/${encodeURIComponent(post.id)}`;
      const text = t("shareText", { title: post.title || t("shareFallbackTitle"), url });
      try {
        if (navigator.share) {
          await navigator.share({ title: post.title, text });
          return;
        }
        await navigator.clipboard.writeText(text);
        toast(tCommon("linkCopied"));
      } catch {
        // Share sheet dismissed.
      }
    },
    [t, tCommon],
  );
}

export function CommunityAvatar({
  user,
  size,
  ring = false,
}: {
  user: CommunityUser;
  size: number;
  ring?: boolean;
}) {
  const name = communityName(user);
  return (
    <span className={cn("inline-block shrink-0 rounded-full", ring && "bg-[#ffc83d] p-[2px]")}>
      <Avatar style={{ width: size, height: size }}>
        {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
        <AvatarFallback className="bg-[#1e1e29] font-extrabold text-white" style={{ fontSize: size * 0.38 }}>
          {name.slice(0, 1).toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
    </span>
  );
}

function LevelBadge({ level }: { level: number }) {
  const t = useTranslations("Gamification");
  return (
    <span className="shrink-0 rounded-lg border-[1.2px] border-[#ffc83d] bg-[#ffc83d]/10 px-1.5 text-xs font-extrabold text-[#ffc83d]">
      {t("levelShortValue", { level })}
    </span>
  );
}

/** Avatar, name, level, time and section ("in Discussions"). */
export function CommunityAuthorHeader({
  post,
  trailing,
  avatarSize = 46,
}: {
  post: CommunityPost;
  trailing?: ReactNode;
  avatarSize?: number;
}) {
  const t = useTranslations("Community");
  const section = sectionLabel(t, post.type);
  const { timeAgo } = useFormats();
  return (
    <div className="flex items-center gap-3">
      <CommunityAvatar user={post.author} size={avatarSize} ring />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-base font-extrabold text-white">{communityName(post.author)}</span>
          {post.author.level != null ? <LevelBadge level={post.author.level} /> : null}
          {post.createdAt ? (
            <span className="shrink-0 text-[13px] text-[#6b6b7e]">• {timeAgo(post.createdAt)}</span>
          ) : null}
        </div>
        {section ? (
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[#6b6b7e]">
            <Gamepad2 className="size-[15px] shrink-0" aria-hidden="true" />
            <span className="truncate">{t("inSection", { section })}</span>
          </p>
        ) : null}
      </div>
      {trailing}
    </div>
  );
}

const SIDE_THUMB_TYPES = new Set(["discussion", "question"]);

export function CommunityPostCard({
  post,
  saved,
  onLike,
  onMore,
}: {
  post: CommunityPost;
  saved: boolean;
  /** Hidden when absent (saved snapshots). */
  onLike?: () => void;
  onMore: () => void;
}) {
  const href = `/community/post/${encodeURIComponent(post.id)}`;
  const game = post.game?.slug ? post.game : null;
  const thumb = game?.thumbnailUrl ?? "";
  const sideThumb = Boolean(game && thumb && SIDE_THUMB_TYPES.has(post.type));
  const liked = Boolean(post.viewerReaction);
  const { compact } = useFormats();
  const t = useTranslations("Community");
  const toggleSaved = useToggleSaved();
  const sharePost = useSharePost();

  const texts = (
    <div className="min-w-0 flex-1">
      {post.title ? (
        <h3 className="line-clamp-3 text-base font-extrabold leading-snug text-white">{post.title}</h3>
      ) : null}
      {post.content ? (
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-[#9c9cb0]">{post.content}</p>
      ) : null}
    </div>
  );

  return (
    <article className="relative rounded-[20px] border border-[#ffc83d]/35 bg-gradient-to-b from-[#1c1b24] to-[#17171f] px-3.5 pb-2 pt-3.5 shadow-[0_0_18px_rgba(255,200,61,0.07)]">
      <Link href={href} aria-label={post.title || t("openPost")} className="absolute inset-0 rounded-[20px]" />
      <CommunityAuthorHeader
        post={post}
        trailing={
          <button
            type="button"
            aria-label={t("moreOptions")}
            onClick={onMore}
            className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-white"
          >
            <MoreHorizontal className="size-5" aria-hidden="true" />
          </button>
        }
      />
      <div className="mt-3 flex items-start gap-3">
        {texts}
        {sideThumb && game ? (
          <Link
            href={`/game/${game.slug}`}
            aria-label={t("openGame", { title: game.title })}
            className="relative z-10 size-24 shrink-0 overflow-hidden rounded-[14px] bg-[#1e1e29]"
          >
            <Image src={thumb} alt="" fill sizes="96px" className="object-cover" />
          </Link>
        ) : null}
      </div>
      {game && !sideThumb ? (
        <Link
          href={`/game/${game.slug}`}
          aria-label={t("openGame", { title: game.title })}
          className="relative z-10 mt-3 block aspect-[16/7.5] overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a1b5c] to-[#14163a]"
        >
          {thumb ? (
            <Image src={thumb} alt="" fill sizes="(max-width: 640px) 100vw, 600px" className="object-cover" />
          ) : (
            <Gamepad2 className="absolute right-[15%] top-1/2 size-14 -translate-y-1/2 text-white/30" aria-hidden="true" />
          )}
          <span className="absolute inset-0 bg-gradient-to-r from-[#0b0b10]/80 to-transparent" />
          <span className="absolute inset-0 flex flex-col p-3">
            <span className="line-clamp-2 w-[62%] text-2xl font-black italic uppercase leading-[1.05] text-white [text-shadow:0_0_8px_rgba(0,0,0,0.54)]">
              {game.title}
            </span>
            <span className="mt-auto flex items-center gap-2">
              <span className="flex min-w-0 flex-1 gap-1.5 overflow-hidden">
                {(game.categories ?? []).map((category, index) => (
                  <span
                    key={category}
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                      index === 0
                        ? "bg-[#ffc83d] text-[#1a1205]"
                        : "border border-[#2a2a37] bg-[#0b0b10]/70 text-white",
                    )}
                  >
                    {category}
                  </span>
                ))}
              </span>
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#2a2a37] bg-[#0b0b10]/70">
                <ArrowRight className="size-[18px] text-white" aria-hidden="true" />
              </span>
            </span>
          </span>
        </Link>
      ) : null}

      <div className="mt-3 border-t border-[#2a2a37] pt-1">
        <div className="flex items-center">
          <div className="flex min-w-0 flex-1 items-center">
            <span
              aria-label={t("likesLabel", { count: post.reactionCount })}
              className="flex items-center gap-1.5 pr-3.5 text-sm font-semibold text-[#9c9cb0]"
            >
              <Heart className="size-[22px] fill-[#ff5d73] text-[#ff5d73]" aria-hidden="true" />
              {compact.format(post.reactionCount)}
            </span>
            <Link
              href={href}
              aria-label={t("commentsLabel", { count: post.commentCount })}
              className="relative z-10 flex h-10 items-center gap-1.5 px-2 text-sm font-semibold text-[#9c9cb0]"
            >
              <MessageCircle className="size-[21px]" aria-hidden="true" />
              {compact.format(post.commentCount)}
            </Link>
            <button
              type="button"
              aria-label={saved ? t("removeFromSaved") : t("savePost")}
              onClick={() => toggleSaved(post)}
              className={cn(
                "relative z-10 grid size-10 place-items-center",
                saved ? "text-[#ffc83d]" : "text-[#9c9cb0]",
              )}
            >
              <Bookmark className={cn("size-6", saved && "fill-current")} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={t("sharePost")}
              onClick={() => void sharePost(post)}
              className="relative z-10 grid size-10 place-items-center text-[#9c9cb0]"
            >
              <Share className="size-[22px]" aria-hidden="true" />
            </button>
          </div>
          {onLike ? (
            <button
              type="button"
              aria-pressed={liked}
              aria-label={liked ? t("unlikePost") : t("likePost")}
              onClick={onLike}
              className={cn(
                "relative z-10 flex min-h-10 items-center gap-1.5 rounded-full border-[1.4px] border-[#ffc83d] px-4 text-sm font-extrabold",
                liked ? "bg-[#ffc83d] text-[#1a1205]" : "bg-[#ffc83d]/10 text-[#ffc83d]",
              )}
            >
              <ThumbsUp className={cn("size-[18px]", liked && "fill-current")} aria-hidden="true" />
              {liked ? t("liked") : t("like")}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

const REPORT_REASONS = [
  ["spam", "reportSpam"],
  ["harassment", "reportHarassment"],
  ["misleading", "reportMisleading"],
  ["other", "reportOther"],
] as const satisfies readonly (readonly [string, keyof Messages["Community"]])[];

const sheetClass =
  "mx-auto max-w-xl rounded-t-[28px] border-[#2a2a37] bg-[#15151d] px-2 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 text-white";

function DragHandle() {
  return <span aria-hidden="true" className="mx-auto mb-2 block h-1 w-8 rounded-full bg-[#6b6b7e]" />;
}

/** Share / bookmark / report / delete sheet for a post. */
export function CommunityPostMenu({
  post,
  onClose,
  onDeleted,
}: {
  post: CommunityPost | null;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const { accessToken, user } = useAuth();
  const queryClient = useQueryClient();
  const promptSignIn = useSignInPrompt();
  const savedPosts = useSavedPosts();
  const [step, setStep] = useState<"menu" | "report" | "delete">("menu");
  const [busy, setBusy] = useState(false);
  const t = useTranslations("Community");
  const tCommon = useTranslations("Common");
  const toErrorMessage = useErrorMessage();
  const toggleSaved = useToggleSaved();
  const sharePost = useSharePost();

  const isMine = Boolean(post && user?.id && user.id === post.author.id);
  const saved = Boolean(post && savedPosts.some((item) => item.id === post.id));

  const close = () => {
    onClose();
    setStep("menu");
  };

  const report = async (reason: string) => {
    if (!post) return;
    setBusy(true);
    try {
      await createReport({ targetType: "post", targetId: post.id, reason });
      toast(t("reportThanks"));
      close();
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!post) return;
    setBusy(true);
    try {
      await deleteCommunityPost(post.id);
      if (saved) toggleSavedPost(post);
      await queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_KEY });
      toast(t("postDeleted"));
      close();
      onDeleted?.();
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const row = "flex h-14 w-full items-center gap-4 rounded-xl px-4 text-left text-base hover:bg-white/5";

  return (
    <Sheet open={post !== null} onOpenChange={(open) => !open && close()}>
      <SheetContent side="bottom" showCloseButton={false} className={sheetClass}>
        <DragHandle />
        {step === "menu" ? (
          <>
            <SheetTitle className="sr-only">{t("postOptions")}</SheetTitle>
            <SheetDescription className="sr-only">{t("postOptionsDescription")}</SheetDescription>
            <button
              type="button"
              className={row}
              onClick={() => {
                if (post) void sharePost(post);
                close();
              }}
            >
              <Share className="size-6" aria-hidden="true" /> {t("sharePost")}
            </button>
            <button
              type="button"
              className={row}
              onClick={() => {
                if (post) toggleSaved(post);
                close();
              }}
            >
              {saved ? (
                <BookmarkMinus className="size-6" aria-hidden="true" />
              ) : (
                <BookmarkPlus className="size-6" aria-hidden="true" />
              )}
              {saved ? t("removeFromSaved") : t("savePost")}
            </button>
            {isMine ? (
              <button type="button" className={cn(row, "text-[#ff5d73]")} onClick={() => setStep("delete")}>
                <Trash2 className="size-6" aria-hidden="true" /> {t("deletePost")}
              </button>
            ) : (
              <button
                type="button"
                className={row}
                onClick={() => {
                  if (!accessToken) {
                    close();
                    promptSignIn(t("signInToReport"));
                    return;
                  }
                  setStep("report");
                }}
              >
                <Flag className="size-6" aria-hidden="true" /> {t("reportPost")}
              </button>
            )}
          </>
        ) : step === "report" ? (
          <div className="px-2">
            <SheetTitle className="px-2 pb-2 text-lg font-extrabold text-white">{t("reportTitle")}</SheetTitle>
            <SheetDescription className="sr-only">{t("reportDescription")}</SheetDescription>
            {REPORT_REASONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                disabled={busy}
                onClick={() => void report(value)}
                className="flex h-12 w-full items-center rounded-xl px-2 text-left text-base hover:bg-white/5 disabled:opacity-50"
              >
                {t(label)}
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 pb-1">
            <SheetTitle className="text-lg font-extrabold text-white">{t("deletePostTitle")}</SheetTitle>
            <SheetDescription className="mt-1 text-sm text-[#9c9cb0]">
              {t("deletePostMessage")}
            </SheetDescription>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={close} className="h-10 rounded-full px-4 text-sm font-bold text-[#ffc83d]">
                {tCommon("cancel")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void remove()}
                className="h-10 rounded-full px-4 text-sm font-bold text-[#ff5d73] disabled:opacity-50"
              >
                {tCommon("delete")}
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-[#2a2a37] bg-[#1e1e29] px-4 py-3 text-sm text-white outline-none placeholder:text-[#6b6b7e] focus:border-[#ffc83d] disabled:opacity-60";

/** "New Post" sheet: type, title and message. */
export function CommunityComposer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<"discussion" | "question">("discussion");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const t = useTranslations("Community");
  const toErrorMessage = useErrorMessage();

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      setError(t("composerRequired"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createCommunityPost({ type, title: title.trim(), content: content.trim() });
      await queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_KEY });
      setTitle("");
      setContent("");
      onClose();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" showCloseButton={false} className={cn(sheetClass, "px-5")}>
        <DragHandle />
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <SheetTitle className="text-xl font-black text-white">{t("newPostTitle")}</SheetTitle>
          <SheetDescription className="sr-only">{t("composerDescription")}</SheetDescription>
          <MobilePillTabs
            label={t("postType")}
            labels={[t("typeDiscussion"), t("typeQuestion")]}
            selectedIndex={type === "discussion" ? 0 : 1}
            onChange={(index) => setType(index === 0 ? "discussion" : "question")}
          />
          <input
            aria-label={t("titleHint")}
            placeholder={t("titleHint")}
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass}
          />
          <textarea
            aria-label={t("messageLabel")}
            placeholder={t("contentHint")}
            maxLength={2000}
            rows={4}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className={cn(inputClass, "resize-none")}
          />
          {error ? <p className="text-sm text-[#ff5d73]">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="grid h-12 place-items-center rounded-2xl bg-[#ffc83d] text-sm font-extrabold text-[#1a1205] disabled:opacity-60"
          >
            {submitting ? t("posting") : t("publish")}
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
