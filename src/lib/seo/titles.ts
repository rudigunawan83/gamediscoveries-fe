import type { Messages } from "next-intl";
import { SITE_NAME } from "@/lib/seo/constants";

export type SeoTranslator = (
  key: keyof Messages["Seo"],
  values?: Record<string, string | number>,
) => string;

export function gameTitle(t: SeoTranslator, gameName: string): string {
  return t("gameTitle", { game: gameName });
}

export function categoryTitle(t: SeoTranslator, categoryName: string): string {
  return t("categoryTitle", { category: categoryName });
}

export function collectionTitle(name: string): string {
  return name;
}

export function gamesLikeTitle(t: SeoTranslator, gameName: string): string {
  return t("gamesLikeTitle", { game: gameName });
}

export function withSiteName(title: string): string {
  return `${title} | ${SITE_NAME}`;
}
