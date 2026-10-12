import { describe, expect, it } from "vitest";
import { pageHref, pageWindow, parsePageParam } from "@/lib/seo/pagination";

describe("catalog pagination", () => {
  it("parses only positive integers", () => {
    expect(parsePageParam(undefined)).toBe(1);
    expect(parsePageParam("3")).toBe(3);
    expect(parsePageParam("0")).toBe(1);
    expect(parsePageParam("-2")).toBe(1);
    expect(parsePageParam("2.5")).toBe(1);
    expect(parsePageParam("abc")).toBe(1);
    expect(parsePageParam(["4", "5"])).toBe(4);
  });

  it("keeps page 1 on the bare path", () => {
    expect(pageHref("/games", 1)).toBe("/games");
    expect(pageHref("/games", 2)).toBe("/games?page=2");
  });

  it("links the first, last, and nearby pages", () => {
    expect(pageWindow(1, 1)).toEqual([1]);
    expect(pageWindow(1, 10)).toEqual([1, 2, 3, 10]);
    expect(pageWindow(6, 10)).toEqual([1, 4, 5, 6, 7, 8, 10]);
    expect(pageWindow(10, 10)).toEqual([1, 8, 9, 10]);
    expect(pageWindow(1, 0)).toEqual([]);
  });
});
