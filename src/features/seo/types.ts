import type { Game } from "@/types/game";

export type SeoCategory = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  gameCount?: number;
  lastContentAt?: string;
};

export type SeoCollection = {
  slug: string;
  title: string;
  description: string;
  rationale?: string;
  image?: string;
  updatedAt: string;
  /** Editorial / hybrid game slug list. */
  gameSlugs: string[];
  /** Resolved at render time. */
  games?: Game[];
  localeHints?: Array<"en" | "id">;
};

export type SeoOpportunity = {
  id: string;
  target: string;
  kind: "title" | "description" | "content" | "internal-links" | "conversion";
  message: string;
  severity: "low" | "medium" | "high";
};

export type OrphanPageReport = {
  page: string;
  incomingLinks: number;
  indexable: boolean;
  status: "ok" | "orphan" | "thin" | "private";
};
