import type { MetadataRoute } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import {
  BRAND_BACKGROUND_COLOR,
  BRAND_THEME_COLOR,
  SITE_NAME,
} from "@/lib/seo/constants";

/** Browsers fetch the manifest without cookies, so the locale usually comes from Accept-Language. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [locale, t, tSeo] = await Promise.all([
    getLocale(),
    getTranslations("Manifest"),
    getTranslations("Seo"),
  ]);

  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: t("description", {
      tagline: tSeo("tagline"),
      siteDescription: tSeo("siteDescription"),
    }),
    start_url: "/",
    scope: "/",
    id: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: BRAND_BACKGROUND_COLOR,
    theme_color: BRAND_THEME_COLOR,
    lang: locale,
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: t("discover"),
        short_name: t("discover"),
        description: t("discoverDescription"),
        url: "/",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: t("trending"),
        short_name: t("trending"),
        description: t("trendingDescription"),
        url: "/trending",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: t("quickPlay"),
        short_name: t("quickPlay"),
        description: t("quickPlayDescription"),
        url: "/hot-games",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: t("myGames"),
        short_name: t("myGames"),
        description: t("myGamesDescription"),
        url: "/my-games",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: t("search"),
        short_name: t("search"),
        description: t("searchDescription"),
        url: "/search",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
