import { SEO_CONFIG } from "@/lib/seo/config";
import { isPrivateSeoPath } from "@/lib/seo/canonical";
import type { Game } from "@/types/game";
import type { SeoCategory, SeoCollection } from "@/features/seo/types";

export type IndexDecision = {
  index: boolean;
  follow: boolean;
  reasons: string[];
};

function decide(index: boolean, follow: boolean, reasons: string[]): IndexDecision {
  return { index, follow, reasons };
}

export function shouldIndexPage(input: {
  path: string;
  public?: boolean;
  contentQuality?: boolean;
  blocked?: boolean;
}): IndexDecision {
  const reasons: string[] = [];
  if (input.blocked) {
    reasons.push("blocked");
    return decide(false, false, reasons);
  }
  if (input.public === false || isPrivateSeoPath(input.path)) {
    reasons.push("private-or-auth");
    return decide(false, false, reasons);
  }
  if (input.contentQuality === false) {
    reasons.push("quality-gate-failed");
    return decide(false, true, reasons);
  }
  reasons.push("ok");
  return decide(true, true, reasons);
}

export function shouldIndexGame(game: Game | null | undefined): IndexDecision {
  if (!game) {
    return decide(false, false, ["missing"]);
  }
  if (game.status && game.status !== "published") {
    return decide(false, false, [`status:${game.status}`]);
  }
  if (!game.slug || !game.title?.trim()) {
    return decide(false, false, ["incomplete-identity"]);
  }
  const hasPlay = Boolean(game.playUrl || game.gameUrl);
  if (!hasPlay) {
    return decide(false, true, ["unavailable"]);
  }
  return decide(true, true, ["published-playable"]);
}

export function shouldIndexCategory(category: SeoCategory): IndexDecision {
  if (!SEO_CONFIG.enableProgrammaticPages) {
    return decide(false, true, ["programmatic-disabled"]);
  }
  if (!category.slug || !category.name) {
    return decide(false, false, ["incomplete"]);
  }
  if ((category.gameCount ?? 0) < SEO_CONFIG.minGamesForCategoryIndexing) {
    return decide(false, true, ["below-min-games"]);
  }
  return decide(true, true, ["ok"]);
}

export function shouldIndexCollection(collection: SeoCollection): IndexDecision {
  const gameCount = collection.gameSlugs?.length ?? collection.games?.length ?? 0;
  if (gameCount < SEO_CONFIG.minGamesForCollectionIndexing) {
    return decide(false, true, ["below-min-games"]);
  }
  if (
    !collection.description ||
    collection.description.trim().length < SEO_CONFIG.minContentLength
  ) {
    return decide(false, true, ["thin-description"]);
  }
  return decide(true, true, ["ok"]);
}

export function shouldIndexGamesLike(similarCount: number): IndexDecision {
  if (!SEO_CONFIG.enableGamesLike) {
    return decide(false, true, ["games-like-disabled"]);
  }
  if (similarCount < SEO_CONFIG.minGamesForGamesLikeIndexing) {
    return decide(false, true, ["below-min-similars"]);
  }
  return decide(true, true, ["ok"]);
}

export function shouldIndexCommunityPost(input: {
  contentLength: number;
  publicVisibility: boolean;
  moderationStatus: string;
  engagement?: number;
}): IndexDecision {
  if (!SEO_CONFIG.enableCommunityIndexing) {
    return decide(false, true, ["community-indexing-disabled"]);
  }
  if (!input.publicVisibility) {
    return decide(false, false, ["not-public"]);
  }
  if (input.moderationStatus !== "approved" && input.moderationStatus !== "visible") {
    return decide(false, false, [`moderation:${input.moderationStatus}`]);
  }
  if (input.contentLength < SEO_CONFIG.minCommunityContentLength) {
    return decide(false, true, ["thin-content"]);
  }
  return decide(true, true, ["ok"]);
}

/** Search result URLs must not explode the index. */
export function shouldIndexSearch(): IndexDecision {
  return decide(false, true, ["search-noindex"]);
}
