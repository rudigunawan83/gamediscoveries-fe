import type { Metadata, Viewport } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { createMetadata } from "@/lib/seo/metadata";
import {
  BRAND_THEME_COLOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo/constants";
import { env } from "@/config/env";
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

export const metadata: Metadata = createMetadata();

export const viewport: Viewport = {
  themeColor: BRAND_THEME_COLOR,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              alternateName: ["Game Discoveries", SITE_TAGLINE],
              url: env.NEXT_PUBLIC_APP_URL,
              description: SITE_DESCRIPTION,
              inLanguage: "en",
              potentialAction: {
                "@type": "SearchAction",
                target: `${env.NEXT_PUBLIC_APP_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: env.NEXT_PUBLIC_APP_URL,
              logo: `${env.NEXT_PUBLIC_APP_URL}/favicon.png`,
              description: SITE_DESCRIPTION,
              sameAs: [],
            },
          ]}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
