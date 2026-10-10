import type { Metadata, Viewport } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
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
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

const display = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const sans = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
          <AppProviders languageMode={languageMode}>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
