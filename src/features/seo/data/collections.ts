import type { CollectionMessageKey, SeoCollection } from "@/features/seo/types";

/**
 * Curated collections only — no mass thin-page generation.
 * gameSlugs are filled at runtime from live catalog filters when empty.
 * English copy is canonical (indexability, admin); keep it in sync with `Collections` in messages/en.json.
 */
export const CURATED_COLLECTIONS: SeoCollection[] = [
  {
    slug: "best-browser-games",
    messageKey: "bestBrowserGames",
    title: "Best Browser Games",
    description:
      "A curated set of free HTML5 browser games you can play instantly — no download required. Great starting points for discovering your next favorite title.",
    rationale:
      "Selected from popular and highly played catalog titles that work well in modern browsers.",
    updatedAt: "2026-10-01T00:00:00.000Z",
    gameSlugs: [],
    localeHints: ["en", "id"],
  },
  {
    slug: "best-mobile-games",
    messageKey: "bestMobileGames",
    title: "Best Mobile Games",
    description:
      "Mobile-ready free online games optimized for touch controls and smaller screens. Play on the go without installing an app store title.",
    rationale: "Pulled from catalog games marked mobile-ready with solid playability.",
    updatedAt: "2026-10-01T00:00:00.000Z",
    gameSlugs: [],
    localeHints: ["en", "id"],
  },
  {
    slug: "best-2-player-games",
    messageKey: "best2PlayerGames",
    title: "Best 2 Player Games",
    description:
      "Games to play with a friend — local or online multiplayer picks from the GameDiscoveries catalog.",
    rationale: "Focused on multiplayer-capable titles suitable for two players.",
    updatedAt: "2026-10-01T00:00:00.000Z",
    gameSlugs: [],
    localeHints: ["en", "id"],
  },
  {
    slug: "hidden-gems",
    messageKey: "hiddenGems",
    title: "Hidden Gems",
    description:
      "Lesser-known free online games worth trying. Fresh discoveries beyond the usual top charts.",
    rationale: "Prioritizes newer catalog additions that are playable and under-discovered.",
    updatedAt: "2026-10-01T00:00:00.000Z",
    gameSlugs: [],
    localeHints: ["en", "id"],
  },
  {
    slug: "games-to-play-with-friends",
    messageKey: "gamesToPlayWithFriends",
    title: "Games to Play with Friends",
    description:
      "Shareable multiplayer and party-friendly browser games for hanging out with friends online.",
    rationale: "Multiplayer and social play experiences from the live catalog.",
    updatedAt: "2026-10-01T00:00:00.000Z",
    gameSlugs: [],
    localeHints: ["en", "id"],
  },
];

export function getCollectionBySlug(slug: string): SeoCollection | undefined {
  return CURATED_COLLECTIONS.find((c) => c.slug === slug);
}

export type CollectionsTranslator = (
  key: `${CollectionMessageKey}.${"title" | "description" | "rationale"}`,
) => string;

/** Swaps the canonical English copy for the active locale; call after indexability checks. */
export function localizeCollection(
  collection: SeoCollection,
  t: CollectionsTranslator,
): SeoCollection {
  const key = collection.messageKey;
  if (!key) return collection;
  return {
    ...collection,
    title: t(`${key}.title`),
    description: t(`${key}.description`),
    rationale: collection.rationale ? t(`${key}.rationale`) : undefined,
  };
}
