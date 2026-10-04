import type { Metadata } from "next";
import { env } from "@/config/env";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo/constants";

export function createMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  noIndex = false,
  image,
}: {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  image?: string;
} = {}): Metadata {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const url = new URL(path, env.NEXT_PUBLIC_APP_URL).toString();
  const ogImage = image ?? "/favicon.png";

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
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      shortcut: ["/favicon.png"],
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      title: pageTitle,
      description,
      url,
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: SITE_NAME,
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
          follow: false,
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
