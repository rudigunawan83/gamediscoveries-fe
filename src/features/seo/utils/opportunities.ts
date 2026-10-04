import { scoreGameSeo } from "@/lib/seo/quality-score";
import type { SeoOpportunity } from "@/features/seo/types";
import type { Game } from "@/types/game";

/** Deterministic opportunity hints from on-site signals (not Search Console). */
export function detectSeoOpportunities(games: Game[]): SeoOpportunity[] {
  const opportunities: SeoOpportunity[] = [];

  for (const game of games.slice(0, 100)) {
    const score = scoreGameSeo(game);
    if (!game.description || game.description.trim().length < 40) {
      opportunities.push({
        id: `desc-${game.slug}`,
        target: `/game/${game.slug}`,
        kind: "description",
        message: `${game.title} has a thin or missing description — improve unique about-copy before indexing push.`,
        severity: "high",
      });
    }
    if (!game.categories.length) {
      opportunities.push({
        id: `cat-${game.slug}`,
        target: `/game/${game.slug}`,
        kind: "internal-links",
        message: `${game.title} has no category — category linking and discovery will be weak.`,
        severity: "medium",
      });
    }
    if (score < 50) {
      opportunities.push({
        id: `score-${game.slug}`,
        target: `/game/${game.slug}`,
        kind: "content",
        message: `${game.title} SEO quality score is ${score}/100 — complete metadata and content sections.`,
        severity: score < 35 ? "high" : "medium",
      });
    }
  }

  return opportunities.slice(0, 50);
}
