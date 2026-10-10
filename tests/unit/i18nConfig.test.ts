import { describe, expect, it } from "vitest";
import { negotiateLocale, parseLanguageMode, resolveLocale } from "@/i18n/config";

describe("negotiateLocale", () => {
  it.each([
    ["id-ID,id;q=0.9,en;q=0.8", "id"],
    ["en-US,en;q=0.9", "en"],
    ["ja-JP,ja;q=0.9", "en"],
    ["fr;q=0.9, id;q=0.5", "id"],
    ["en;q=0.2, id;q=0.8", "id"],
    ["id;q=0, en;q=0.5", "en"],
    ["", "en"],
  ])("%s -> %s", (header, expected) => {
    expect(negotiateLocale(header)).toBe(expected);
  });

  it("falls back to English without a header", () => {
    expect(negotiateLocale(null)).toBe("en");
  });
});

describe("resolveLocale", () => {
  it("prefers an explicit choice over the browser", () => {
    expect(resolveLocale("en", "id-ID")).toBe("en");
    expect(resolveLocale("id", "en-US")).toBe("id");
  });

  it("follows the browser for SYSTEM or no choice", () => {
    expect(resolveLocale("SYSTEM", "id-ID")).toBe("id");
    expect(resolveLocale(null, "en-GB")).toBe("en");
  });
});

describe("parseLanguageMode", () => {
  it("accepts only API values", () => {
    expect(parseLanguageMode("SYSTEM")).toBe("SYSTEM");
    expect(parseLanguageMode("id")).toBe("id");
    expect(parseLanguageMode("ID")).toBeNull();
    expect(parseLanguageMode("fr")).toBeNull();
    expect(parseLanguageMode(undefined)).toBeNull();
  });
});
