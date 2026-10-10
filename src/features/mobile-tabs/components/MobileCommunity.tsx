"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Bookmark, Gamepad2, MessagesSquare, Plus, Search, SearchX, X } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { listCommunityPosts, type CommunityPost, type CommunityPostSort } from "@/lib/api/community";
import { cn } from "@/lib/utils";
import { useSavedPosts } from "../lib/savedCommunityPosts";
import {
  COMMUNITY_POSTS_KEY,
  CommunityComposer,
  CommunityPostCard,
  CommunityPostMenu,
  useLikePost,
  useSignInPrompt,
} from "./MobileCommunityUi";
import { MobileSubpageHeader } from "./MobileSubpageHeader";
import { MobileGameListSkeleton, MobileMessage } from "./MobileTabUi";

const SORTS: { value: CommunityPostSort; label: string; emoji?: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "trending", label: "Trending", emoji: "🔥" },
  { value: "most_liked", label: "Most Liked", emoji: "👑" },
];

const GOLD_ICON = (
  <Gamepad2 aria-hidden="true" className="size-[34px] shrink-0 text-[#ffc83d] drop-shadow-[0_1px_0_#f5a524]" />
);

/** Mirrors the app's Community screen: sort tabs, search, post feed and composer. */
export function MobileCommunity() {
  const { accessToken } = useAuth();
  const promptSignIn = useSignInPrompt();
  const [sort, setSort] = useState<CommunityPostSort>("latest");
  const [searching, setSearching] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(input.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [input]);

  const closeSearch = () => {
    setSearching(false);
    setInput("");
    setSearch("");
  };

  return (
    <div className="pb-24">
      <MobileSubpageHeader
        icon={searching ? null : GOLD_ICON}
        title={
          searching ? (
            <label className="flex h-10 items-center gap-2 rounded-2xl border border-[#2a2a37] bg-[#1e1e29] px-3">
              <Search className="size-5 shrink-0 text-[#9c9cb0]" aria-hidden="true" />
              <input
                autoFocus
                type="search"
                aria-label="Search posts"
                placeholder="Search posts"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setSearch(input.trim());
                }}
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#6b6b7e]"
              />
            </label>
          ) : (
            <h1 className="truncate text-2xl font-black text-white">Community</h1>
          )
        }
        action={
          searching ? (
            <button
              type="button"
              aria-label="Close search"
              onClick={closeSearch}
              className="grid size-11 shrink-0 place-items-center text-white"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          ) : (
            <span className="mr-1 flex shrink-0 items-center gap-1">
              <Link
                href="/community/saved"
                aria-label="Saved posts"
                className="grid size-11 place-items-center text-white"
              >
                <Bookmark className="size-6" aria-hidden="true" />
              </Link>
              <button
                type="button"
                aria-label="Search posts"
                onClick={() => setSearching(true)}
                className="grid size-11 place-items-center rounded-full border border-[#2a2a37] bg-[#15151d] text-white"
              >
                <Search className="size-6" aria-hidden="true" />
              </button>
            </span>
          )
        }
      />

      <div role="tablist" aria-label="Sort posts" className="flex gap-2 pb-2.5 pt-1">
        {SORTS.map((item) => {
          const selected = item.value === sort;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setSort(item.value)}
              className={cn(
                "flex h-11 min-w-0 flex-auto items-center justify-center gap-1 rounded-2xl border px-3 text-[13px] font-extrabold transition-colors",
                selected
                  ? "border-[#ffc83d] bg-gradient-to-b from-[#ffd866] to-[#ffc83d] text-[#1a1205] shadow-[0_0_14px_rgba(255,200,61,0.35)]"
                  : "border-[#2a2a37] bg-[#15151d] text-[#9c9cb0]",
              )}
            >
              {item.emoji ? (
                <span aria-hidden="true" className="text-[15px]">
                  {item.emoji}
                </span>
              ) : null}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      <PostFeed key={`${sort}:${search}`} sort={sort} search={search} />

      <button
        type="button"
        aria-label="New post"
        onClick={() => {
          if (!accessToken) promptSignIn("Sign in to post in the community.");
          else setComposerOpen(true);
        }}
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-40 grid size-14 place-items-center rounded-2xl bg-[#ffc83d] text-[#1a1205] shadow-[0_6px_20px_rgba(255,200,61,0.35)]"
      >
        <Plus className="size-[30px]" aria-hidden="true" />
      </button>
      <CommunityComposer open={composerOpen} onClose={() => setComposerOpen(false)} />
    </div>
  );
}

function PostFeed({ sort, search }: { sort: CommunityPostSort; search: string }) {
  const { accessToken } = useAuth();
  const like = useLikePost();
  const saved = useSavedPosts();
  const [menuPost, setMenuPost] = useState<CommunityPost | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const query = useInfiniteQuery({
    queryKey: [...COMMUNITY_POSTS_KEY, { sort, search, signedIn: Boolean(accessToken) }],
    queryFn: async ({ pageParam }) =>
      (await listCommunityPosts({ sort, q: search, cursor: pageParam })).data ?? { items: [] },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "600px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const seen = new Set<string>();
  const items = (query.data?.pages.flatMap((page) => page.items) ?? []).filter((post) => {
    if (seen.has(post.id)) return false;
    seen.add(post.id);
    return true;
  });
  const savedIds = new Set(saved.map((post) => post.id));

  if (query.isPending) return <MobileGameListSkeleton count={4} />;
  if (query.isError) {
    return (
      <div className="rounded-[18px] border border-[#ff5d73]/40 bg-[#15151d] p-4">
        <p className="text-sm text-[#9c9cb0]">Something went wrong. Please try again.</p>
        <button type="button" onClick={() => void query.refetch()} className="mt-2 text-sm font-bold text-[#ffc83d]">
          Try again
        </button>
      </div>
    );
  }
  if (items.length === 0) {
    return search ? (
      <MobileMessage
        icon={SearchX}
        title="No posts found"
        message={`Nothing matches "${search}". Try another word.`}
      />
    ) : (
      <MobileMessage icon={MessagesSquare} title="Nothing here yet" message="Start the conversation with the + button." />
    );
  }

  return (
    <>
      <ul className="space-y-3.5">
        {items.map((post) => (
          <li key={post.id}>
            <CommunityPostCard
              post={post}
              saved={savedIds.has(post.id)}
              onLike={() => void like(post)}
              onMore={() => setMenuPost(post)}
            />
          </li>
        ))}
      </ul>
      <div ref={sentinel} aria-hidden="true" />
      {isFetchingNextPage ? (
        <div className="mt-3.5">
          <MobileGameListSkeleton count={1} />
        </div>
      ) : null}
      <CommunityPostMenu post={menuPost} onClose={() => setMenuPost(null)} />
    </>
  );
}

/** Bookmarked posts, stored on this device. */
export function MobileCommunitySaved() {
  const saved = useSavedPosts();
  const [menuPost, setMenuPost] = useState<CommunityPost | null>(null);

  return (
    <div>
      <MobileSubpageHeader title="Saved Posts" fallbackHref="/community" />
      {saved.length === 0 ? (
        <MobileMessage icon={Bookmark} title="No saved posts" message="Tap the bookmark on a post to keep it here." />
      ) : (
        <ul className="space-y-3.5 pb-8">
          {saved.map((post) => (
            <li key={post.id}>
              <CommunityPostCard post={post} saved onMore={() => setMenuPost(post)} />
            </li>
          ))}
        </ul>
      )}
      <CommunityPostMenu post={menuPost} onClose={() => setMenuPost(null)} />
    </div>
  );
}
