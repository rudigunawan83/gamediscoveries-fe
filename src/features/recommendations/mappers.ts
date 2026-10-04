import type { RecommendationItemDto } from "@/lib/api/recommendations";
import type { Game } from "@/types/game";

export function mapRecommendationItems(items: RecommendationItemDto[]): Game[] {
  return items.map((item) => ({
    id: item.game.id,
    slug: item.game.slug,
    title: item.game.title,
    thumbnailUrl: item.game.thumbnailUrl ?? "",
    categories: item.game.category
      ? [
          {
            id: item.game.category,
            slug: item.game.category.toLowerCase().replace(/\s+/g, "-"),
            name: item.game.category,
          },
        ]
      : [],
    tags: [],
    orientation:
      item.game.orientation === "portrait" ||
      item.game.orientation === "landscape" ||
      item.game.orientation === "both"
        ? item.game.orientation
        : undefined,
  }));
}
