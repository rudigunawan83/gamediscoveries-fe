import { describe, expect, it, vi } from "vitest";
import type { Game } from "@/types/game";
import { canonicalGamePath } from "@/lib/seo/indexability";
import { buildSitemapEntries, STATIC_SITEMAP_ROUTES } from "@/lib/seo/sitemap-builder";
import { seoTranslator } from "./helpers/intl";

vi.mock("next-intl/server", () => ({
  getLocale: async () => "en",
  getTranslations: async () => seoTranslator("en"),
}));

const { generateGameMetadata, generateCategoryMetadata } = await import("@/lib/seo/metadata");

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const game: Game = {
  id: "g1",
  slug: "space-runner",
  title: "Space Runner",
  thumbnailUrl: "https://cdn.example/thumb.png",
  categories: [{ id: "c1", slug: "action", name: "Action" }],
  tags: [],
  description: "Dodge asteroids in an endless space run.",
  playUrl: "https://cdn.example/play",
  status: "published",
};

const urls = (entries: ReturnType<typeof buildSitemapEntries>) => entries.map((entry) => entry.url);

describe("sitemap eligibility", () => {
  it("lists static routes, eligible categories, and each canonical game once", () => {
    const entries = buildSitemapEntries({
      categories: [
        { id: "1", slug: "action", name: "Action", gameCount: 40, lastContentAt: "2026-10-01T00:00:00Z" },
        { id: "2", slug: "tiny", name: "Tiny", gameCount: 2 },
      ],
      collections: [],
      games: [
        { slug: "space-runner", lastModified: "2026-10-05T00:00:00Z" },
        { slug: "space-runner", lastModified: "2026-10-05T00:00:00Z" },
        { slug: "", lastModified: "2026-10-05T00:00:00Z" },
      ],
    });

    const list = urls(entries);
    expect(list).toHaveLength(STATIC_SITEMAP_ROUTES.length + 2);
    expect(list).toContain(`${APP_URL}/games/action`);
    expect(list).not.toContain(`${APP_URL}/games/tiny`);
    expect(list.filter((url) => url === `${APP_URL}/game/space-runner`)).toHaveLength(1);
  });

  it("uses content timestamps for lastmod", () => {
    const entries = buildSitemapEntries({
      categories: [],
      collections: [],
      games: [{ slug: "space-runner", lastModified: "2026-10-05T12:00:00Z" }],
    });
    const gameEntry = entries.find((entry) => entry.url.endsWith("/game/space-runner"));
    expect(gameEntry?.lastModified).toEqual(new Date("2026-10-05T12:00:00Z"));
  });

  it("never lists private or search routes", () => {
    const list = urls(buildSitemapEntries({ categories: [], collections: [], games: [] }));
    for (const blocked of ["/search", "/login", "/profile", "/progress", "/admin", "/favorites"]) {
      expect(list).not.toContain(`${APP_URL}${blocked}`);
    }
  });

  it("emits absolute URLs via the canonical builder", () => {
    const list = urls(
      buildSitemapEntries({
        categories: [],
        collections: [],
        games: [{ slug: "space-runner", lastModified: "2026-10-05T00:00:00Z" }],
      }),
    );
    for (const url of list) {
      expect(url).toMatch(/^https?:\/\//);
      expect(url.startsWith(APP_URL!)).toBe(true);
    }
  });
});

describe("canonical consistency", () => {
  it("points duplicate titles at the canonical copy", () => {
    expect(canonicalGamePath({ slug: "space-runner-2", canonicalSlug: "space-runner" })).toBe(
      "/game/space-runner",
    );
    expect(canonicalGamePath({ slug: "space-runner", canonicalSlug: "space-runner" })).toBe(
      "/game/space-runner",
    );
    expect(canonicalGamePath({ slug: "space-runner" })).toBe("/game/space-runner");
  });

  it("game metadata canonical and og:url match the canonical path", async () => {
    const metadata = await generateGameMetadata({
      ...game,
      slug: "space-runner-2",
      canonicalSlug: "space-runner",
    });
    expect(metadata.alternates?.canonical).toBe(`${APP_URL}/game/space-runner`);
    expect(metadata.openGraph?.url).toBe(`${APP_URL}/game/space-runner`);
  });
});

describe("page metadata", () => {
  it("indexes published playable games with a self canonical", async () => {
    const metadata = await generateGameMetadata(game);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.alternates?.canonical).toBe(`${APP_URL}/game/space-runner`);
    expect(String(metadata.title)).toContain("Space Runner");
    expect(metadata.description).toMatch(/space runner/i);
  });

  it("noindexes archived games and games without a play URL", async () => {
    const archived = await generateGameMetadata({ ...game, status: "archived" });
    expect(archived.robots).toMatchObject({ index: false, follow: false });

    const unplayable = await generateGameMetadata({ ...game, playUrl: undefined, gameUrl: undefined });
    expect(unplayable.robots).toMatchObject({ index: false, follow: true });
  });

  it("noindexes non-canonical slug copies while pointing canonical at the primary", async () => {
    const metadata = await generateGameMetadata({
      ...game,
      slug: "space-runner-2",
      canonicalSlug: "space-runner",
    });
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe(`${APP_URL}/game/space-runner`);
  });

  it("falls back to icon-512 for OG when no game image exists", async () => {
    const metadata = await generateGameMetadata({
      ...game,
      thumbnailUrl: "",
      coverUrl: undefined,
    });
    const images = metadata.openGraph?.images;
    const first = Array.isArray(images) ? images[0] : images;
    expect(first && typeof first === "object" && "url" in first ? first.url : first).toBe(
      "/icons/icon-512.png",
    );
  });

  it("does not emit hreflang or OG alternateLocale without real locale routes", async () => {
    const metadata = await generateGameMetadata(game);
    expect(metadata.alternates?.languages).toBeUndefined();
    expect(metadata.openGraph?.alternateLocale).toBeUndefined();
  });

  it("noindexes thin categories but keeps links followable", async () => {
    const metadata = await generateCategoryMetadata({ id: "2", slug: "tiny", name: "Tiny", gameCount: 2 });
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe(`${APP_URL}/games/tiny`);
  });
});
