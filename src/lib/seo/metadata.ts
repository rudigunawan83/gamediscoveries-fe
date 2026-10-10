import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { env } from "@/config/env";
import { SITE_NAME } from "@/lib/seo/constants";
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
import { localizeCollection } from "@/features/seo/data/collections";
import type { SeoCategory, SeoCollection } from "@/features/seo/types";
import {
  shouldIndexCategory,
  shouldIndexCollection,
  shouldIndexGame,
  shouldIndexGamesLike,
} from "@/lib/seo/indexability";

const OG_LOCALES: Record<string, string> = { en: "en_US", id: "id_ID" };

/** Titles and descriptions follow the request locale; the canonical URL is shared by all locales. */
export async function createMetadata({
  title,
  description,
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
} = {}): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("Seo")]);
  const pageTitle = title
    ? withSiteName(title)
    : `${SITE_NAME} — ${t("tagline")}`;
  description ??= t("siteDescription");
  const ogLocale = OG_LOCALES[locale] ?? OG_LOCALES.en!;
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
      locale: ogLocale,
      alternateLocale: Object.values(OG_LOCALES).filter((item) => item !== ogLocale),
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

export async function generateGameMetadata(game: Game): Promise<Metadata> {
  const decision = shouldIndexGame(game);
  const t = await getTranslations("Seo");
  return createMetadata({
    title: gameTitle(t, game.title),
    description: gameDescription(t, game),
    path: `/game/${game.slug}`,
    image: game.coverUrl ?? game.thumbnailUrl,
    noIndex: !decision.index,
    follow: decision.follow,
  });
}

export async function generateCategoryMetadata(category: SeoCategory): Promise<Metadata> {
  const decision = shouldIndexCategory(category);
  const t = await getTranslations("Seo");
  return createMetadata({
    title: categoryTitle(t, category.name),
    description: categoryDescription(
      t,
      category.name,
      category.gameCount ?? 0,
    ),
    path: `/games/${category.slug}`,
    noIndex: !decision.index,
    follow: decision.follow,
  });
}

export async function generateCollectionMetadata(
  collection: SeoCollection,
): Promise<Metadata> {
  const decision = shouldIndexCollection(collection);
  const [t, tCollections] = await Promise.all([
    getTranslations("Seo"),
    getTranslations("Collections"),
  ]);
  const localized = localizeCollection(collection, tCollections);
  return createMetadata({
    title: collectionTitle(localized.title),
    description: collectionDescription(
      t,
      localized.title,
      localized.description,
    ),
    path: `/collections/${collection.slug}`,
    image: collection.image,
    noIndex: !decision.index,
    follow: decision.follow,
  });
}

export async function generateGamesLikeMetadata(
  game: Game,
  similarCount: number,
): Promise<Metadata> {
  const decision = shouldIndexGamesLike(similarCount);
  const t = await getTranslations("Seo");
  return createMetadata({
    title: gamesLikeTitle(t, game.title),
    description: gamesLikeDescription(t, game.title, similarCount),
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
}): Promise<Metadata> {
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
