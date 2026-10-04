import { describe, expect, it } from "vitest";
import {
  isPlayableGame,
  validatePlayUrl,
} from "@/features/game-player/utils/playerUrl";

describe("validatePlayUrl", () => {
  it("accepts trusted https embed hosts", () => {
    const result = validatePlayUrl(
      "https://html5.gamemonetize.co/abc123/",
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.url).toContain("https://html5.gamemonetize.co/");
    }
  });

  it("rejects missing urls", () => {
    const result = validatePlayUrl("");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("missing");
  });

  it("rejects non-https urls", () => {
    const result = validatePlayUrl("http://html5.gamemonetize.co/abc");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("insecure");
  });

  it("rejects untrusted hosts", () => {
    const result = validatePlayUrl("https://evil.example/game");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("untrusted_host");
  });

  it("rejects invalid urls", () => {
    const result = validatePlayUrl("not a url");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("invalid");
  });
});

describe("isPlayableGame", () => {
  it("requires published status and valid play url", () => {
    expect(
      isPlayableGame("published", "https://html5.gamemonetize.co/x"),
    ).toBe(true);
    expect(isPlayableGame("archived", "https://html5.gamemonetize.co/x")).toBe(
      false,
    );
    expect(isPlayableGame("published", null)).toBe(false);
  });
});
