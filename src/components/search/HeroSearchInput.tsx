"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { analytics } from "@/lib/analytics/client";

export function HeroSearchInput() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    analytics.track("search", { query: nextQuery });
    router.push(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : "/search");
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="relative w-full max-w-[34rem]"
    >
      <input
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search games, categories, or genres..."
        aria-label="Search games, categories, or genres"
        className="h-[3.35rem] w-full rounded-full border-0 bg-white px-6 pr-[3.75rem] text-[0.95rem] text-slate-900 shadow-[0_12px_40px_rgb(0_0_0_/_40%)] outline-none placeholder:text-slate-400 focus-visible:ring-4 focus-visible:ring-[#a855f7]/35"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1.5 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-gradient text-[#1a1205] shadow-[0_8px_22px_rgb(224_122_32_/_55%)] transition-transform hover:scale-105 active:scale-95"
      >
        <Search className="size-[1.05rem]" strokeWidth={2.4} aria-hidden="true" />
      </button>
    </form>
  );
}
