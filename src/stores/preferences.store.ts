"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PreferencesState {
  reducedMotion: boolean;
  favoriteSlugs: string[];
  toggleFavorite: (slug: string) => void;
  setReducedMotion: (value: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      reducedMotion: false,
      favoriteSlugs: [],
      toggleFavorite: (slug) => {
        const current = get().favoriteSlugs;
        const next = current.includes(slug)
          ? current.filter((item) => item !== slug)
          : [...current, slug];
        set({ favoriteSlugs: next });
      },
      setReducedMotion: (value) => set({ reducedMotion: value }),
    }),
    {
      name: "gamediscoveries.preferences",
    },
  ),
);
