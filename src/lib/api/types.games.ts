export interface GameSummaryDto {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  coverUrl?: string | null;
  gameUrl?: string | null;
  category?: string | null;
  platform?: string | null;
  mobileReady: boolean;
  publishedAt?: string | null;
}

export interface GameDetailDto {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  thumbnailUrl?: string | null;
  coverUrl?: string | null;
  gameUrl?: string | null;
  embedUrl?: string | null;
  category?: string | null;
  developer?: string | null;
  platform?: string | null;
  status: string;
  mobileReady: boolean;
  orientation?: string | null;
  width?: number | null;
  height?: number | null;
  tags?: string[] | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface HomeDiscoveriesDto {
  featured: GameSummaryDto[];
  trending: GameSummaryDto[];
  latest: GameSummaryDto[];
  popular: GameSummaryDto[];
  mobile: GameSummaryDto[];
  multiplayer: GameSummaryDto[];
}
