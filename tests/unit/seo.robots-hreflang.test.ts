import { describe, expect, it } from "vitest";
import { isPrivateSeoPath } from "@/lib/seo/canonical";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";
import { ROBOTS_ALLOW, ROBOTS_DISALLOW } from "@/lib/seo/robots-rules";

describe("robots rules", () => {
  it("disallows private account surfaces but not search", () => {
    expect(ROBOTS_DISALLOW).toEqual(
      expect.arrayContaining([
        "/login",
        "/signup",
        "/my-games",
        "/favorites",
        "/history",
        "/settings",
        "/progress",
        "/admin",
        "/api/",
      ]),
    );
    expect(ROBOTS_DISALLOW).not.toContain("/search");
    expect(ROBOTS_ALLOW).not.toContain("/discover/");
  });

  it("treats personal hubs as private SEO paths", () => {
    expect(isPrivateSeoPath("/favorites")).toBe(true);
    expect(isPrivateSeoPath("/history")).toBe(true);
    expect(isPrivateSeoPath("/settings")).toBe(true);
    expect(isPrivateSeoPath("/progress")).toBe(true);
    expect(isPrivateSeoPath("/profile")).toBe(true);
    expect(isPrivateSeoPath("/profile/alice")).toBe(false);
    expect(isPrivateSeoPath("/game/space-runner")).toBe(false);
  });
});

describe("hreflang", () => {
  it("emits nothing when Indonesian locale routes do not exist", () => {
    expect(buildHreflangAlternates({ path: "/game/space-runner" })).toBeUndefined();
    expect(
      buildHreflangAlternates({
        path: "/game/space-runner",
        availableLocales: ["en"],
      }),
    ).toBeUndefined();
  });

  it("emits reciprocal language URLs only when callers supply real locales", () => {
    const languages = buildHreflangAlternates({
      path: "/games",
      availableLocales: ["en", "id"],
    });
    expect(languages?.en).toMatch(/\/games$/);
    expect(languages?.id).toMatch(/\/id\/games$/);
    expect(languages?.["x-default"]).toMatch(/\/games$/);
  });
});
