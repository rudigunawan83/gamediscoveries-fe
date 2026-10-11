import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { getLanguageMode } from "@/i18n/request";
import { createMetadata } from "@/lib/seo/metadata";
import {
  BRAND_THEME_COLOR,
  SITE_NAME,
} from "@/lib/seo/constants";
import {
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/structured-data";
import { PageViewTracker } from "@/features/seo/components/PageViewTracker";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

// Self-hosted: next/font/google fetches at build time and Turbopack fails on
// Google's extensionless font URLs (vercel/next.js#99114).
const display = localFont({
  src: "./fonts/montserrat-latin.woff2",
  variable: "--font-display",
  weight: "400 800",
  display: "swap",
});

const sans = localFont({
  src: "./fonts/montserrat-latin.woff2",
  variable: "--font-sans",
  weight: "400 800",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await createMetadata()),
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: SITE_NAME,
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}

export const viewport: Viewport = {
  themeColor: BRAND_THEME_COLOR,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const languageMode = await getLanguageMode();
  const tSeo = await getTranslations("Seo");

  return (
    <html
      lang={locale}
      className={`dark ${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd
          data={[
            websiteJsonLd({ description: tSeo("siteDescription"), inLanguage: locale }),
            organizationJsonLd({ description: tSeo("tagline") }),
          ]}
        />
        <NextIntlClientProvider>
          <AppProviders languageMode={languageMode}>
            {children}
            <PageViewTracker />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
