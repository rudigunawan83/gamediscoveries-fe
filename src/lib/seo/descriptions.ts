import type { SeoTranslator } from "@/lib/seo/titles";
import type { Game } from "@/types/game";

function trimDesc(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

/** Game title, description and category names are catalog content and stay untranslated. */
export function gameDescription(t: SeoTranslator, game: Game): string {
  const category = game.categories[0]?.name;
  const bits: string[] = [t("gameDescIntro", { game: game.title })];

  if (game.description?.trim()) {
    bits.push(game.description.trim());
  }

  const extras: string[] = [];
  if (category) extras.push(category.toLowerCase());
  if (game.mobileReady) extras.push(t("extraMobileReady"));
  if (game.multiplayer) extras.push(t("extraMultiplayer"));
  bits.push(
    extras.length
      ? t("gameDescOutroExtras", { extras: extras.join(" / ") })
      : t("gameDescOutro"),
  );

  return trimDesc(bits.join(" "));
}

export function categoryDescription(
  t: SeoTranslator,
  categoryName: string,
  gameCount: number,
): string {
  return trimDesc(
    t("categoryDescription", {
      category: categoryName.toLowerCase(),
      count: gameCount,
    }),
  );
}

export function collectionDescription(
  t: SeoTranslator,
  title: string,
  description: string,
): string {
  return trimDesc(description || t("collectionDescription", { title }));
}

export function gamesLikeDescription(
  t: SeoTranslator,
  gameName: string,
  count: number,
): string {
  return trimDesc(t("gamesLikeDescription", { game: gameName, count }));
}
