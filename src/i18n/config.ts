export const locales = ["en", "id"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Cookie holding the language mode; shared with no URL prefix. */
export const LOCALE_COOKIE = "gd-locale";

/** Values match the API's `preferredLanguage`. */
export const languageModes = ["SYSTEM", "en", "id"] as const;
export type LanguageMode = (typeof languageModes)[number];

export function parseLanguageMode(value: unknown): LanguageMode | null {
  return typeof value === "string" && (languageModes as readonly string[]).includes(value)
    ? (value as LanguageMode)
    : null;
}

/** Picks the best supported locale from an Accept-Language header. */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  const ranked = (acceptLanguage ?? "")
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((param) => param.trim())
        .find((param) => param.startsWith("q="));
      const quality = q ? Number(q.slice(2)) : 1;
      return {
        language: tag.trim().toLowerCase().split("-")[0],
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      };
    })
    .filter((entry) => entry.language && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  const match = ranked.find((entry) => (locales as readonly string[]).includes(entry.language));
  return (match?.language as Locale | undefined) ?? defaultLocale;
}

/** An explicit choice wins; SYSTEM or no choice follows the browser. */
export function resolveLocale(
  mode: LanguageMode | null,
  acceptLanguage: string | null | undefined,
): Locale {
  return mode && mode !== "SYSTEM" ? mode : negotiateLocale(acceptLanguage);
}
