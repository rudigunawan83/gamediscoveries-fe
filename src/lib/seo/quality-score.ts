import type { Game } from "@/types/game";
import type { SeoCategory, SeoCollection } from "@/features/seo/types";

/** Internal diagnostic score 0–100 — not a Google ranking score. */
export function scoreGameSeo(game: Game): number {
  let score = 0;
  if (game.title?.trim()) score += 15;
  if (game.slug) score += 10;
  if (game.description && game.description.trim().length >= 40) score += 20;
  else if (game.description?.trim()) score += 8;
  if (game.thumbnailUrl || game.coverUrl) score += 10;
  if (game.categories.length) score += 10;
  if (game.tags.length) score += 5;
  if (game.instructions?.trim()) score += 10;
  if (game.playUrl || game.gameUrl) score += 10;
  if (game.mobileReady) score += 5;
  if (game.status === "published" || !game.status) score += 5;
  return Math.min(100, score);
}

export function scoreCategorySeo(category: SeoCategory): number {
  let score = 0;
  if (category.name) score += 20;
  if (category.slug) score += 15;
  if (category.description && category.description.length >= 40) score += 25;
  else if (category.description) score += 10;
  const count = category.gameCount ?? 0;
  if (count >= 24) score += 30;
  else if (count >= 8) score += 20;
  else if (count >= 3) score += 10;
  return Math.min(100, score);
}

export function scoreCollectionSeo(collection: SeoCollection): number {
  let score = 0;
  if (collection.title) score += 20;
  if (collection.slug) score += 10;
  if (collection.description && collection.description.length >= 60) score += 30;
  else if (collection.description) score += 12;
  const count = collection.gameSlugs?.length ?? collection.games?.length ?? 0;
  if (count >= 12) score += 30;
  else if (count >= 6) score += 20;
  else if (count >= 3) score += 10;
  if (collection.rationale?.trim()) score += 10;
  return Math.min(100, score);
}
