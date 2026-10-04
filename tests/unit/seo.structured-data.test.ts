import { describe, expect, it } from "vitest";
import {
  breadcrumbJsonLd,
  gameSoftwareJsonLd,
  websiteJsonLd,
} from "@/lib/seo/structured-data";
import type { Game } from "@/types/game";

const game: Game = {
  id: "1",
  slug: "neon-drift",
  title: "Neon Drift",
  description: "Arcade racing",
  thumbnailUrl: "https://example.com/a.png",
  categories: [{ id: "c", slug: "racing", name: "Racing" }],
  tags: [],
  developer: "Studio X",
};

describe("structured data", () => {
  it("builds website SearchAction", () => {
    const data = websiteJsonLd();
    expect(data["@type"]).toBe("WebSite");
    expect(data.potentialAction).toBeTruthy();
  });

  it("only includes verified game fields", () => {
    const data = gameSoftwareJsonLd(game, true);
    expect(data.name).toBe("Neon Drift");
    expect(data.genre).toEqual(["Racing"]);
    expect(data.aggregateRating).toBeUndefined();
    expect(data.author).toEqual({
      "@type": "Organization",
      name: "Studio X",
    });
  });

  it("builds breadcrumb list", () => {
    const data = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Games", path: "/games" },
    ]);
    expect(data["@type"]).toBe("BreadcrumbList");
    expect((data.itemListElement as unknown[]).length).toBe(2);
  });
});
