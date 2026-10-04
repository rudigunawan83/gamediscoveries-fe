import type { MetadataRoute } from "next";
import { env } from "@/config/env";
import { ROBOTS_DISALLOW } from "@/lib/seo/robots-rules";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...ROBOTS_DISALLOW],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: [...ROBOTS_DISALLOW],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: [...ROBOTS_DISALLOW],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: [...ROBOTS_DISALLOW],
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: [...ROBOTS_DISALLOW],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: [...ROBOTS_DISALLOW],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: [...ROBOTS_DISALLOW],
      },
    ],
    sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
    host: env.NEXT_PUBLIC_APP_URL,
  };
}
