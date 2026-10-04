import { describe, expect, it } from "vitest";
import {
  shouldIndexCategory,
  shouldIndexCollection,
  shouldIndexGame,
  shouldIndexGamesLike,
  shouldIndexSearch,
} from "@/lib/seo/indexability";
import { buildCanonicalUrl, normalizePath } from "@/lib/seo/canonical";
import { gameTitle, categoryTitle } from "@/lib/seo/titles";
import { gameDescription } from "@/lib/seo/descriptions";
import { scoreGameSeo } from "@/lib/seo/quality-score";
import type { Game } from "@/types/game";

const baseGame: Game = {
  id: "1",
  slug: "subway-surfers",
  title: "Subway Surfers",
  thumbnailUrl: "https://example.com/thumb.png",
  categories: [{ id: "c1", slug: "action", name: "Action" }],
  tags: ["runner"],
  description: "Endless runner game with vibrant worlds.",
  playUrl: "https://example.com/play",
  status: "published",
};

describe("SEO indexability", () => {
  it("indexes published playable games", () => {
    expect(shouldIndexGame(baseGame).index).toBe(true);
  });

  it("does not index missing play URL", () => {
    expect(
      shouldIndexGame({ ...baseGame, playUrl: undefined, gameUrl: undefined })
        .index,
    ).toBe(false);
  });

  it("noindexes search", () => {
    const decision = shouldIndexSearch();
    expect(decision.index).toBe(false);
    expect(decision.follow).toBe(true);
  });

  it("gates categories by game count", () => {
    expect(
      shouldIndexCategory({
        id: "1",
        slug: "action",
        name: "Action",
        gameCount: 2,
      }).index,
    ).toBe(false);
    expect(
      shouldIndexCategory({
        id: "1",
        slug: "action",
        name: "Action",
        gameCount: 12,
      }).index,
    ).toBe(true);
  });

  it("gates games-like by similar count", () => {
    expect(shouldIndexGamesLike(2).index).toBe(false);
    expect(shouldIndexGamesLike(8).index).toBe(true);
  });

  it("gates thin collections", () => {
    expect(
      shouldIndexCollection({
        slug: "thin",
        title: "Thin",
        description: "short",
        updatedAt: new Date().toISOString(),
        gameSlugs: ["a"],
      }).index,
    ).toBe(false);
  });
});

describe("SEO metadata helpers", () => {
  it("builds unique game titles and descriptions", () => {
    expect(gameTitle("Subway Surfers")).toContain("Subway Surfers");
    expect(categoryTitle("Action")).toContain("Action");
    const desc = gameDescription(baseGame);
    expect(desc.toLowerCase()).toContain("subway surfers");
    expect(desc).not.toMatch(/best amazing fun exciting/i);
  });

  it("normalizes canonical paths", () => {
    expect(normalizePath("/games/action/")).toBe("/games/action");
    expect(buildCanonicalUrl("/game/test")).toMatch(/\/game\/test$/);
  });

  it("scores game SEO deterministically", () => {
    const score = scoreGameSeo(baseGame);
    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThanOrEqual(100);
  });
});
