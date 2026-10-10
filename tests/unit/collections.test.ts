import { describe, expect, it } from "vitest";
import { createTranslator } from "next-intl";
import {
  CURATED_COLLECTIONS,
  getCollectionBySlug,
  localizeCollection,
} from "@/features/seo/data/collections";
import { shouldIndexCollection } from "@/lib/seo/indexability";
import en from "../../messages/en.json";
import id from "../../messages/id.json";

const translator = (locale: "en" | "id") =>
  createTranslator({ locale, messages: locale === "en" ? en : id, namespace: "Collections" });

describe("curated collections", () => {
  it.each(CURATED_COLLECTIONS.map((c) => [c.slug, c] as const))(
    "%s keeps its canonical English copy in sync with messages",
    (_slug, collection) => {
      expect(collection.messageKey).toBeTruthy();
      expect(localizeCollection(collection, translator("en"))).toEqual(collection);
    },
  );

  it("localizes copy for Indonesian without touching slug or games", () => {
    const base = { ...getCollectionBySlug("hidden-gems")!, gameSlugs: ["a", "b"] };
    const localized = localizeCollection(base, translator("id"));

    expect(localized.title).toBe("Permata Tersembunyi");
    expect(localized.rationale).toMatch(/^Mengutamakan/);
    expect(localized.slug).toBe("hidden-gems");
    expect(localized.gameSlugs).toEqual(["a", "b"]);
  });

  it("leaves collections without a message key untouched", () => {
    const fallback = { slug: "x", title: "X", description: "Y", updatedAt: "", gameSlugs: [] };
    expect(localizeCollection(fallback, translator("id"))).toBe(fallback);
  });

  it("keeps Indonesian descriptions long enough to stay indexable", () => {
    for (const collection of CURATED_COLLECTIONS) {
      const games = Array.from({ length: 24 }, (_, i) => `g${i}`);
      const localized = localizeCollection({ ...collection, gameSlugs: games }, translator("id"));
      expect(shouldIndexCollection(localized).index).toBe(true);
    }
  });
});
