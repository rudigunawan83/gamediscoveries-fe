"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createCommunityPost } from "@/lib/api/community";
import { analytics } from "@/lib/analytics/client";
import { Button } from "@/components/ui/button";

export function CreatePostForm({ onCreated }: { onCreated?: () => void }) {
  const { user, accessToken } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("discussion");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!accessToken || !user) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
        Sign in to start a game discussion.
      </div>
    );
  }

  return (
    <form
      className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        setError(null);
        void createCommunityPost({ type, title, content })
          .then(() => {
            analytics.track("community_post_created", { type });
            setTitle("");
            setContent("");
            onCreated?.();
          })
          .catch((err: Error) => setError(err.message || "Failed to create post"))
          .finally(() => setBusy(false));
      }}
    >
      <h2 className="font-display text-lg font-semibold text-white">
        What&apos;s happening in GameDiscoveries?
      </h2>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
      >
        <option value="discussion">Discussion</option>
        <option value="question">Question</option>
      </select>
      <p className="text-xs text-muted-foreground">
        For game-linked discussions, shares, and reviews, open a game page and
        use Community / Reviews there.
      </p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        maxLength={160}
        required
        className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share thoughts about a game..."
        maxLength={4000}
        required
        rows={4}
        className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <Button type="submit" disabled={busy}>
        {busy ? "Posting…" : "Post to Community"}
      </Button>
    </form>
  );
}
