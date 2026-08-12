/**
 * uiStore — transient UI state, per docs/05-frontend-architecture.md,
 * Section 6: modal/overlay flags, audio mute — never persisted server
 * state, never a source of truth for anything the backend also tracks.
 */
import { create } from "zustand";

interface UIState {
  isMuted: boolean;
  hasEnteredExperience: boolean;
  toggleMuted: () => void;
  setEnteredExperience: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMuted: true, // Autoplay-safe default — per docs/05-frontend-architecture.md,
  // Section 13: audio requires an initial user gesture; starting muted
  // avoids a blocked-autoplay error before that gesture happens.
  hasEnteredExperience: false,
  toggleMuted: () => set((s) => ({ isMuted: !s.isMuted })),
  setEnteredExperience: (value) => set({ hasEnteredExperience: value }),
}));
