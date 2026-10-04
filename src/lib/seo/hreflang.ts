import { SEO_CONFIG } from "@/lib/seo/config";
import { buildCanonicalUrl } from "@/lib/seo/canonical";

/**
 * Only emit hreflang when a real localized alternate exists.
 * Do not invent fake translations.
 */
export function buildHreflangAlternates(input: {
  path: string;
  /** Locales that actually have translated content for this path. */
  availableLocales?: string[];
}): Record<string, string> | undefined {
  const available = (input.availableLocales ?? []).filter((locale) =>
    SEO_CONFIG.supportedLocales.includes(locale),
  );

  if (available.length < 2) {
    return undefined;
  }

  const languages: Record<string, string> = {};
  for (const locale of available) {
    // Future locale prefix architecture: /en/... /id/...
    // Until localized routes exist, only emit when callers pass real URLs via availableLocales + path convention.
    const localePath =
      locale === SEO_CONFIG.defaultLocale
        ? input.path
        : `/${locale}${input.path === "/" ? "" : input.path}`;
    languages[locale] = buildCanonicalUrl(localePath);
  }
  languages["x-default"] = buildCanonicalUrl(input.path);
  return languages;
}
