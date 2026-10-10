"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bookmark, Eye, Gamepad2, Heart, Loader2, MessageCircle, Reply, SendHorizontal, Share, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  createComment,
  deleteComment,
  getCommunityPost,
  getPostComments,
  type CommunityUser,
} from "@/lib/api/community";
import { useFormats } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import { useSavedPosts } from "../lib/savedCommunityPosts";
import {
  COMMUNITY_POSTS_KEY,
  CommunityAuthorHeader,
  CommunityAvatar,
  communityName,
  inputClass,
  useErrorMessage,
  useLikePost,
  useSharePost,
  useToggleSaved,
} from "./MobileCommunityUi";
import { MobileSubpageHeader } from "./MobileSubpageHeader";

/** Must match the API's `Community:CommentMaxLength`. */
const COMMENT_MAX_LENGTH = 1500;

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: CommunityUser;
  replies?: Comment[];
};

/** Mirrors the app's community post screen: post body, threaded comments and composer. */
export function MobileCommunityPost({ postId }: { postId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, user } = useAuth();
  const signedIn = Boolean(accessToken);
  const like = useLikePost();
  const saved = useSavedPosts().some((post) => post.id === postId);
  const { compact } = useFormats();
  const t = useTranslations("Community");
  const tCommon = useTranslations("Common");
  const toErrorMessage = useErrorMessage();
  const toggleSaved = useToggleSaved();
  const sharePost = useSharePost();

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [sending, setSending] = useState(false);
  const [toDelete, setToDelete] = useState<Comment | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const postQuery = useQuery({
    queryKey: ["community", "post", postId],
    queryFn: async () => (await getCommunityPost(postId)).data,
  });
  const commentsKey = ["community", "comments", postId];
  const commentsQuery = useQuery({
    queryKey: commentsKey,
    queryFn: async () => ((await getPostComments(postId)).data ?? []) as Comment[],
  });

  const post = postQuery.data;
  const comments = commentsQuery.data;
  const commentCount = comments
    ? comments.reduce((sum, item) => sum + 1 + (item.replies?.length ?? 0), 0)
    : (post?.commentCount ?? 0);

  const refreshLists = () => queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_KEY });

  const send = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      await createComment(postId, content, replyTo?.id);
      setText("");
      setReplyTo(null);
      textarea.current?.blur();
      await queryClient.invalidateQueries({ queryKey: commentsKey });
      void refreshLists();
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const confirmDelete = async () => {
    const comment = toDelete;
    if (!comment) return;
    setToDelete(null);
    try {
      await deleteComment(comment.id);
      if (replyTo?.id === comment.id) setReplyTo(null);
      await queryClient.invalidateQueries({ queryKey: commentsKey });
      void refreshLists();
      toast(t("commentDeleted"));
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const startReply = (comment: Comment) => {
    setReplyTo(comment);
    textarea.current?.focus();
  };

  return (
    <div className="pb-28">
      <MobileSubpageHeader
        title={t("postTitle")}
        fallbackHref="/community"
        action={
          post ? (
            <span className="flex shrink-0 items-center">
              <button
                type="button"
                aria-label={saved ? t("removeFromSaved") : t("savePost")}
                onClick={() => toggleSaved(post)}
                className={cn("grid size-11 place-items-center", saved ? "text-[#ffc83d]" : "text-white")}
              >
                <Bookmark className={cn("size-6", saved && "fill-current")} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={t("sharePost")}
                onClick={() => void sharePost(post)}
                className="grid size-11 place-items-center text-white"
              >
                <Share className="size-[22px]" aria-hidden="true" />
              </button>
            </span>
          ) : null
        }
      />

      {postQuery.isPending ? (
        <div className="space-y-3 pt-2" aria-hidden="true">
          <div className="h-12 w-2/3 rounded-2xl bg-[#17171f]" />
          <div className="h-6 w-4/5 rounded-lg bg-[#17171f]" />
          <div className="h-24 rounded-2xl bg-[#17171f]" />
        </div>
      ) : postQuery.isError || !post ? (
        <div className="rounded-[18px] border border-[#ff5d73]/40 bg-[#15151d] p-4">
          <p className="text-sm text-[#9c9cb0]">{t("loadPostError")}</p>
          <button
            type="button"
            onClick={() => void postQuery.refetch()}
            className="mt-2 text-sm font-bold text-[#ffc83d]"
          >
            {tCommon("retry")}
          </button>
        </div>
      ) : (
        <>
          <article className="pt-2">
            <CommunityAuthorHeader post={post} avatarSize={48} />
            {post.title ? <h2 className="mt-4 text-xl font-black text-white">{post.title}</h2> : null}
            {post.content ? (
              <p className="mt-2.5 whitespace-pre-wrap text-base leading-relaxed text-[#9c9cb0]">{post.content}</p>
            ) : null}
            {post.game?.slug ? (
              <Link
                href={`/game/${post.game.slug}`}
                className="mt-3.5 inline-flex h-9 items-center gap-2 rounded-xl border border-[#2a2a37] bg-[#15151d] px-3 text-sm font-semibold text-white"
              >
                <Gamepad2 className="size-4 text-[#ffc83d]" aria-hidden="true" />
                {post.game.title}
              </Link>
            ) : null}
            <div className="mt-4 flex items-center gap-4 text-sm text-white">
              <button
                type="button"
                aria-pressed={Boolean(post.viewerReaction)}
                aria-label={post.viewerReaction ? t("unlikePost") : t("likePost")}
                onClick={() => void like(post)}
                className={cn(
                  "flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 font-bold",
                  post.viewerReaction ? "border-[#ff5d73] bg-[#ff5d73]/15" : "border-[#2a2a37] bg-[#15151d]",
                )}
              >
                <Heart
                  className={cn("size-5 text-[#ff5d73]", post.viewerReaction && "fill-current")}
                  aria-hidden="true"
                />
                {compact.format(post.reactionCount)}
              </button>
              <span className="flex items-center gap-1" aria-label={t("commentsLabel", { count: commentCount })}>
                <MessageCircle className="size-[18px] text-[#9c9cb0]" aria-hidden="true" />
                {compact.format(commentCount)}
              </span>
              {post.viewCount > 0 ? (
                <span className="flex items-center gap-1" aria-label={t("viewsLabel", { count: post.viewCount })}>
                  <Eye className="size-[18px] text-[#9c9cb0]" aria-hidden="true" />
                  {compact.format(post.viewCount)}
                </span>
              ) : null}
            </div>
          </article>

          <div className="my-5 h-px bg-[#2a2a37]" />
          <h3 className="text-base font-extrabold text-white">{t("commentsCount", { count: commentCount })}</h3>
          <div className="mt-3">
            {commentsQuery.isPending ? (
              <div className="grid place-items-center py-6">
                <Loader2 className="size-6 animate-spin text-[#ffc83d]" aria-label={t("loadingComments")} />
              </div>
            ) : commentsQuery.isError ? (
              <div className="py-4 text-center">
                <p className="text-sm text-[#9c9cb0]">{tCommon("errorGeneric")}</p>
                <button
                  type="button"
                  onClick={() => void commentsQuery.refetch()}
                  className="mt-1 text-sm font-bold text-[#ffc83d]"
                >
                  {tCommon("retry")}
                </button>
              </div>
            ) : (comments ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-[#9c9cb0]">{t("noComments")}</p>
            ) : (
              <ul className="space-y-3">
                {(comments ?? []).map((comment) => (
                  <li key={comment.id}>
                    <CommentTile
                      comment={comment}
                      isMine={comment.author.id === user?.id}
                      onReply={signedIn ? () => startReply(comment) : undefined}
                      onDelete={() => setToDelete(comment)}
                    />
                    {comment.replies?.length ? (
                      <ul className="ml-[18px] mt-2 space-y-2 border-l-2 border-[#2a2a37] pl-3">
                        {comment.replies.map((reply) => (
                          <li key={reply.id}>
                            <CommentTile
                              comment={reply}
                              isMine={reply.author.id === user?.id}
                              onDelete={() => setToDelete(reply)}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#2a2a37] bg-[#15151d] pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto max-w-xl py-2 pl-4 pr-2">
              {!signedIn ? (
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-sm text-[#9c9cb0]">{t("signInToComment")}</p>
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="h-10 px-3 text-sm font-bold text-[#ffc83d]"
                  >
                    {tCommon("signIn")}
                  </button>
                </div>
              ) : (
                <>
                  {replyTo ? (
                    <div className="flex items-center gap-1.5 text-[13px] text-[#9c9cb0]">
                      <Reply className="size-4 shrink-0 text-[#ffc83d]" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">
                        {t("replyingTo", { name: communityName(replyTo.author) })}
                      </span>
                      <button
                        type="button"
                        aria-label={t("cancelReply")}
                        onClick={() => setReplyTo(null)}
                        className="grid size-8 place-items-center"
                      >
                        <X className="size-[18px]" aria-hidden="true" />
                      </button>
                    </div>
                  ) : null}
                  <form
                    className="flex items-end gap-1"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void send();
                    }}
                  >
                    <textarea
                      ref={textarea}
                      aria-label={replyTo ? t("writeReplyLabel") : t("writeCommentLabel")}
                      placeholder={replyTo ? t("writeReply") : t("writeComment")}
                      rows={Math.min(4, Math.max(1, text.split("\n").length))}
                      maxLength={COMMENT_MAX_LENGTH}
                      disabled={sending}
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      className={cn(inputClass, "resize-none py-2.5")}
                    />
                    <button
                      type="submit"
                      aria-label={t("sendComment")}
                      disabled={sending || !text.trim()}
                      className="grid size-11 shrink-0 place-items-center text-[#ffc83d] disabled:text-[#6b6b7e]"
                    >
                      {sending ? (
                        <Loader2 className="size-[22px] animate-spin" aria-hidden="true" />
                      ) : (
                        <SendHorizontal className="size-6" aria-hidden="true" />
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <Sheet open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="mx-auto max-w-xl rounded-t-[28px] border-[#2a2a37] bg-[#15151d] px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-5 text-white"
        >
          <SheetTitle className="text-lg font-extrabold text-white">{t("deleteCommentTitle")}</SheetTitle>
          <SheetDescription className="text-sm text-[#9c9cb0]">{t("deleteCommentMessage")}</SheetDescription>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setToDelete(null)}
              className="h-10 rounded-full px-4 text-sm font-bold text-[#ffc83d]"
            >
              {tCommon("cancel")}
            </button>
            <button
              type="button"
              onClick={() => void confirmDelete()}
              className="h-10 rounded-full px-4 text-sm font-bold text-[#ff5d73]"
            >
              {tCommon("delete")}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CommentTile({
  comment,
  isMine,
  onReply,
  onDelete,
}: {
  comment: Comment;
  isMine: boolean;
  /** Only top-level comments accept replies. */
  onReply?: () => void;
  onDelete: () => void;
}) {
  const { timeAgo } = useFormats();
  const t = useTranslations("Community");
  const tCommon = useTranslations("Common");
  const tGamification = useTranslations("Gamification");
  return (
    <div className="flex items-start gap-2.5 rounded-[14px] bg-[#17171f] px-3 pb-1 pt-3">
      <CommunityAvatar user={comment.author} size={34} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">
          <span className="font-extrabold text-white">
            {isMine ? tGamification("you") : communityName(comment.author)}
          </span>
          <span className="ml-2 text-xs text-[#6b6b7e]">{timeAgo(comment.createdAt)}</span>
        </p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-snug text-white">{comment.content}</p>
        <div className="flex">
          {onReply ? (
            <button type="button" onClick={onReply} className="h-8 px-2 text-sm font-semibold text-[#ffc83d]">
              {t("reply")}
            </button>
          ) : null}
          {isMine ? (
            <button type="button" onClick={onDelete} className="h-8 px-2 text-sm font-semibold text-[#ff5d73]">
              {tCommon("delete")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
