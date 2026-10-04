"use client";

import { create } from "zustand";

interface UiState {
  isMobileNavOpen: boolean;
  isSearchOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMobileNavOpen: false,
  isSearchOpen: false,
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
}));
