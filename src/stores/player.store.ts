"use client";

import { create } from "zustand";

interface PlayerState {
  activeGameSlug: string | null;
  isFullscreen: boolean;
  setActiveGame: (slug: string | null) => void;
  setFullscreen: (value: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  activeGameSlug: null,
  isFullscreen: false,
  setActiveGame: (slug) => set({ activeGameSlug: slug }),
  setFullscreen: (value) => set({ isFullscreen: value }),
}));
