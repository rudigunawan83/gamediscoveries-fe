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
  gameUrl?: string;
  instructions?: string;
  developer?: string;
  width?: number;
  height?: number;
}
