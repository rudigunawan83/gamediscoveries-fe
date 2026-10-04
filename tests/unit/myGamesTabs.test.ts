import { describe, expect, it } from "vitest";
import {
  myGamesTabHref,
  parseMyGamesTab,
} from "@/features/my-games/utils/myGamesTabs";

describe("parseMyGamesTab", () => {
  it("parses known tabs", () => {
    expect(parseMyGamesTab("favorites")).toBe("favorites");
    expect(parseMyGamesTab("history")).toBe("history");
    expect(parseMyGamesTab("all")).toBe("all");
  });

  it("falls back to all for invalid values", () => {
    expect(parseMyGamesTab(null)).toBe("all");
    expect(parseMyGamesTab(undefined)).toBe("all");
    expect(parseMyGamesTab("recommended")).toBe("all");
  });

  it("builds shareable tab hrefs", () => {
    expect(myGamesTabHref("all")).toBe("/my-games");
    expect(myGamesTabHref("favorites")).toBe("/my-games?tab=favorites");
    expect(myGamesTabHref("history")).toBe("/my-games?tab=history");
  });
});
