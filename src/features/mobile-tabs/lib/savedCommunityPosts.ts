"use client";

import { useSyncExternalStore } from "react";
import type { CommunityPost } from "@/lib/api/community";

/** Bookmarks live on this device only, like the app; the API has no saved-posts store. */
const STORAGE_KEY = "gd-saved-community-posts";
const MAX_SAVED = 100;
const EMPTY: CommunityPost[] = [];

const listeners = new Set<() => void>();
let cache: CommunityPost[] | null = null;

function read(): CommunityPost[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    cache = Array.isArray(parsed) ? (parsed as CommunityPost[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Adds the post at the front, or removes it when already saved. */
export function toggleInSavedList(list: CommunityPost[], post: CommunityPost, max = MAX_SAVED) {
  const others = list.filter((item) => item.id !== post.id);
  return others.length < list.length ? others : [post, ...others].slice(0, max);
}

/** Returns `true` when the post is now saved. */
export function toggleSavedPost(post: CommunityPost) {
  const next = toggleInSavedList(read(), post);
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: keep the in-memory list for this session.
  }
  listeners.forEach((listener) => listener());
  return next.some((item) => item.id === post.id);
}

export function useSavedPosts() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
