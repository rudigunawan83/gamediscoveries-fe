import type { Metadata } from "next";
import { env } from "@/config/env";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo/constants";
import { buildCanonicalUrl, normalizePath } from "@/lib/seo/canonical";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";
import {
  categoryDescription,
  collectionDescription,
  gameDescription,
  gamesLikeDescription,
} from "@/lib/seo/descriptions";
import {
  categoryTitle,
  collectionTitle,
  gameTitle,
  gamesLikeTitle,
  withSiteName,
} from "@/lib/seo/titles";
import type { Game } from "@/types/game";
import type { SeoCategory, SeoCollection } from "@/features/seo/types";
import {
  shouldIndexCategory,
  shouldIndexCollection,
  shouldIndexGame,
  shouldIndexGamesLike,
} from "@/lib/seo/indexability";

export function createMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  noIndex = false,
  follow,
  image,
  type = "website",
  availableLocales,
}: {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  /** Defaults to !noIndex. Search pages use noIndex + follow. */
  follow?: boolean;
  image?: string;
  type?: "website" | "article";
  availableLocales?: string[];
} = {}): Metadata {
  const pageTitle = title
    ? withSiteName(title)
    : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const url = buildCanonicalUrl(path);
  const ogImage = image ?? "/favicon.png";
  const shouldFollow = follow ?? !noIndex;
  const languages = buildHreflangAlternates({
    path: normalizePath(path),
    availableLocales,
  });

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: pageTitle,
    description,
    applicationName: SITE_NAME,
    keywords: [
      "free online games",
      "HTML5 games",
      "browser games",
      "hot games",
      "best games",
      "most played games",
      "exclusive games",
      "multiplayer games",
      "mobile games",
      "game online gratis",
      "GameDiscoveries",
    ],
    authors: [{ name: SITE_NAME, url: env.NEXT_PUBLIC_APP_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "games",
    icons: {
      icon: [
        { url: "/favicon.png", sizes: "any", type: "image/png" },
        { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: ["/favicon.png"],
    },
    alternates: {
      canonical: url,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      type,
      locale: "en_US",
      alternateLocale: ["id_ID"],
      siteName: SITE_NAME,
      title: pageTitle,
      description,
      url,
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: title ?? SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: shouldFollow,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function generateGameMetadata(game: Game): Metadata {
  const decision = shouldIndexGame(game);
  return createMetadata({
    title: gameTitle(game.title),
    description: gameDescription(game),
    path: `/game/${game.slug}`,
    image: game.coverUrl ?? game.thumbnailUrl,
    noIndex: !decision.index,
    follow: decision.follow,
  });
}

export function generateCategoryMetadata(category: SeoCategory): Metadata {
  const decision = shouldIndexCategory(category);
  return createMetadata({
    title: categoryTitle(category.name),
    description: categoryDescription(
      category.name,
      category.gameCount ?? 0,
    ),
    path: `/games/${category.slug}`,
    noIndex: !decision.index,
    follow: decision.follow,
  });
}

export function generateCollectionMetadata(
  collection: SeoCollection,
): Metadata {
  const decision = shouldIndexCollection(collection);
  return createMetadata({
    title: collectionTitle(collection.title),
    description: collectionDescription(
      collection.title,
      collection.description,
    ),
    path: `/collections/${collection.slug}`,
    image: collection.image,
    noIndex: !decision.index,
    follow: decision.follow,
  });
}

export function generateGamesLikeMetadata(
  game: Game,
  similarCount: number,
): Metadata {
  const decision = shouldIndexGamesLike(similarCount);
  return createMetadata({
    title: gamesLikeTitle(game.title),
    description: gamesLikeDescription(game.title, similarCount),
    path: `/games-like/${game.slug}`,
    image: game.thumbnailUrl ?? game.coverUrl,
    noIndex: !decision.index,
    follow: decision.follow,
  });
}

export function generateCommunityMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  indexable: boolean;
}): Metadata {
  return createMetadata({
    title: input.title,
    description: input.description,
    path: input.path,
    image: input.image,
    noIndex: !input.indexable,
    follow: true,
    type: "article",
  });
}
