import { SITE_NAME } from "@/lib/seo/constants";

export function gameTitle(gameName: string): string {
  return `Play ${gameName} Online — Free Game`;
}

export function categoryTitle(categoryName: string): string {
  return `Best ${categoryName} Games — Play Free Online`;
}

export function collectionTitle(name: string): string {
  return name;
}

export function gamesLikeTitle(gameName: string): string {
  return `Games Like ${gameName} — Play Free Online`;
}

export function communityGameTitle(gameName: string): string {
  return `${gameName} Community`;
}

export function withSiteName(title: string): string {
  return `${title} | ${SITE_NAME}`;
}
