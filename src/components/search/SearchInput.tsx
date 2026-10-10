"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { analytics } from "@/lib/analytics/client";

interface SearchInputProps {
  initialQuery?: string;
  autoFocus?: boolean;
}

export function SearchInput({ initialQuery = "", autoFocus = false }: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const t = useTranslations("Search");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    analytics.track("search", { query: nextQuery });
    router.push(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : "/search");
  }

  return (
    <form onSubmit={handleSubmit} className="relative" role="search">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        name="q"
        value={query}
        autoFocus={autoFocus}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("placeholder")}
        aria-label={t("label")}
        className="h-12 rounded-2xl border-border/70 bg-background/70 pl-10 text-base shadow-sm"
      />
    </form>
  );
}
