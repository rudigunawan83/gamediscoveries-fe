import type { SeoCollection } from "@/features/seo/types";

/**
 * Curated collections only — no mass thin-page generation.
 * gameSlugs are filled at runtime from live catalog filters when empty.
 */
export const CURATED_COLLECTIONS: SeoCollection[] = [
  {
    slug: "best-browser-games",
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
