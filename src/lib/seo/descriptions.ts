import type { Game } from "@/types/game";

function trimDesc(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

export function gameDescription(game: Game): string {
  const category = game.categories[0]?.name;
  const bits: string[] = [`Play ${game.title} online for free.`];

  if (game.description?.trim()) {
    bits.push(game.description.trim());
  }

  const extras: string[] = [];
  if (category) extras.push(category.toLowerCase());
  if (game.mobileReady) extras.push("mobile-ready");
  if (game.multiplayer) extras.push("multiplayer");
  if (extras.length) {
    bits.push(
      `Discover gameplay, controls, features, related ${extras.join(" / ")} games, and more on GameDiscoveries.`,
    );
  } else {
    bits.push(
      "Discover gameplay, controls, game features, related games, and more on GameDiscoveries.",
    );
  }

  return trimDesc(bits.join(" "));
}

export function categoryDescription(
  categoryName: string,
  gameCount: number,
): string {
  return trimDesc(
    `Discover and play the best ${categoryName.toLowerCase()} games online for free. Browse ${gameCount}+ titles with instant play, similar picks, and mobile-friendly options on GameDiscoveries.`,
  );
}

export function collectionDescription(
  title: string,
  description: string,
): string {
  return trimDesc(description || `${title} — curated free browser games on GameDiscoveries.`);
}

export function gamesLikeDescription(gameName: string, count: number): string {
  return trimDesc(
    `Looking for games like ${gameName}? Explore ${count} similar free browser games with related genres, gameplay, and player favorites on GameDiscoveries.`,
  );
}

export function discoveryPageDescription(kind: string): string {
  switch (kind) {
    case "trending":
      return "See which free browser games are trending right now. Play hot titles instantly on GameDiscoveries.";
    case "new":
      return "Browse newly added free online games and fresh discoveries. Play instantly in your browser on GameDiscoveries.";
    case "mobile":
      return "Play free mobile-friendly HTML5 games online. Optimized for touch, portrait, and on-the-go play on GameDiscoveries.";
    case "multiplayer":
      return "Play free multiplayer and 2-player browser games online with friends. Compete or co-op on GameDiscoveries.";
    default:
      return "Discover and play free online games on GameDiscoveries.";
  }
}
