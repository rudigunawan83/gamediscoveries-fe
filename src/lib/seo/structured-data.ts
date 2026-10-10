import { env } from "@/config/env";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/constants";
import { SEO_CONFIG } from "@/lib/seo/config";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import type { Game } from "@/types/game";

export type JsonLdObject = Record<string, unknown>;

export function websiteJsonLd({
  description = SITE_DESCRIPTION,
  inLanguage = SEO_CONFIG.defaultLocale,
}: { description?: string; inLanguage?: string } = {}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: ["Game Discoveries", SITE_TAGLINE],
    url: env.NEXT_PUBLIC_APP_URL,
    description,
    inLanguage,
    potentialAction: {
      "@type": "SearchAction",
      target: `${env.NEXT_PUBLIC_APP_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd({
  description = SITE_TAGLINE,
}: { description?: string } = {}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: env.NEXT_PUBLIC_APP_URL,
    description,
    logo: `${env.NEXT_PUBLIC_APP_URL}/favicon.png`,
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(item.path),
    })),
  };
}

/**
 * SoftwareApplication / VideoGame markup from verified fields only.
 * Never invent ratings, review counts, or developers.
 */
export function gameSoftwareJsonLd(game: Game, playable: boolean): JsonLdObject {
  const data: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": ["VideoGame", "SoftwareApplication"],
    name: game.title,
    url: buildCanonicalUrl(`/game/${game.slug}`),
    applicationCategory: "Game",
    operatingSystem: "Any",
    gamePlatform: ["HTML5", "Web Browser"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: playable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: env.NEXT_PUBLIC_APP_URL,
    },
  };

  if (game.description?.trim()) {
    data.description = game.description.trim();
  }
  const image = game.coverUrl ?? game.thumbnailUrl;
  if (image) data.image = image;
  if (game.categories.length) {
    data.genre = game.categories.map((c) => c.name);
  }
  if (game.developer?.trim()) {
    data.author = {
      "@type": "Organization",
      name: game.developer.trim(),
    };
  }

  return data;
}

export function itemListJsonLd(
  name: string,
  path: string,
  games: Game[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: buildCanonicalUrl(path),
    numberOfItems: games.length,
    itemListElement: games.slice(0, 24).map((game, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: buildCanonicalUrl(`/game/${game.slug}`),
      name: game.title,
    })),
  };
}
