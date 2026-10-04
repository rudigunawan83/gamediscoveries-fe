export type GameOrientation = "portrait" | "landscape" | "both";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  gameCount?: number;
}

export interface Developer {
  id: string;
  name: string;
  slug?: string;
}

export interface GameProvider {
  id: string;
  name: string;
  code: string;
}

export interface Game {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  coverUrl?: string;
  categories: Category[];
  tags: string[];
  rating?: number;
  playCount?: number;
  mobileReady?: boolean;
  multiplayer?: boolean;
  orientation?: GameOrientation;
  platform?: string;
  provider?: string;
  status?: "draft" | "published" | "archived";
  publishedAt?: string;
  /** @deprecated Prefer playUrl — kept for transitional catalog mapping. */
  gameUrl?: string;
  /**
   * Validated play URL from the GameDiscoveries API.
   * Never populated from user input or query strings.
   */
  playUrl?: string;
  instructions?: string;
  developer?: string;
  width?: number;
  height?: number;
}
