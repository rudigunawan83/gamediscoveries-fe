import type {
  GameDetailDto,
  GameSummaryDto,
} from "@/lib/api/types.games";
import type { Category, Game, GameOrientation } from "@/types/game";
import { decodeHtmlText } from "@/lib/utils/html-text";
import { displayRating } from "@/lib/utils/display-rating";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toCategory(name?: string | null): Category[] {
  if (!name?.trim()) {
    return [];
  }

  const trimmed = name.trim();
  const slug = slugify(trimmed) || "uncategorized";
  return [
    {
      id: `cat-${slug}`,
      slug,
      name: trimmed,
    },
  ];
}

function toOrientation(value?: string | null): GameOrientation | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "portrait" || normalized === "landscape" || normalized === "both") {
    return normalized;
  }

  return undefined;
}

const PLACEHOLDER =
  "https://placehold.co/640x360/0b1220/d4a017/png?text=Game&font=montserrat";

function resolvePlayUrl(embedUrl?: string | null, gameUrl?: string | null): string | undefined {
  const candidate = embedUrl || gameUrl || undefined;
  return candidate?.trim() || undefined;
}

export function mapGameSummary(dto: GameSummaryDto): Game {
  const playUrl = resolvePlayUrl(null, dto.gameUrl);
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    description: decodeHtmlText(dto.description),
    thumbnailUrl: dto.thumbnailUrl || dto.coverUrl || PLACEHOLDER,
    coverUrl: dto.coverUrl || dto.thumbnailUrl || undefined,
    categories: toCategory(dto.category),
    tags: [],
    rating: displayRating(dto.id),
    mobileReady: dto.mobileReady,
    multiplayer: dto.category?.toLowerCase().includes("multiplayer") ?? false,
    status: "published",
    publishedAt: dto.publishedAt ?? undefined,
    gameUrl: playUrl,
    playUrl,
  };
}

export function mapGameDetail(dto: GameDetailDto): Game {
  const playUrl = resolvePlayUrl(dto.embedUrl, dto.gameUrl);
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    description: decodeHtmlText(dto.description),
    instructions: decodeHtmlText(dto.instructions),
    thumbnailUrl: dto.thumbnailUrl || dto.coverUrl || PLACEHOLDER,
    coverUrl: dto.coverUrl || dto.thumbnailUrl || undefined,
    categories: toCategory(dto.category),
    tags: (dto.tags ?? []).filter(Boolean),
    rating: displayRating(dto.id),
    mobileReady: dto.mobileReady,
    multiplayer: dto.category?.toLowerCase().includes("multiplayer") ?? false,
    orientation: toOrientation(dto.orientation),
    platform: dto.platform ?? undefined,
    status:
      dto.status === "draft" || dto.status === "archived"
        ? dto.status
        : "published",
    publishedAt: dto.publishedAt ?? undefined,
    gameUrl: playUrl,
    playUrl,
    developer: dto.developer ?? undefined,
    width: dto.width ?? undefined,
    height: dto.height ?? undefined,
  };
}

export function mapGameSummaries(items: GameSummaryDto[] | null | undefined): Game[] {
  return (items ?? []).map(mapGameSummary);
}
