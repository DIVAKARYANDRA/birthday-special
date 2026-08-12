/**
 * progressionStore — client-side reflection of visitor progression, per
 * docs/05-frontend-architecture.md, Section 6/7.
 *
 * ================================================================
 * IMPORTANT — SCOPE NOTE FOR PROMPT 15 (read before extending this):
 * ================================================================
 * No Public Experience / Progress API exists yet — only the
 * ADMIN-authenticated APIs from Prompt 14 exist on the backend, and this
 * app (apps/web) must never call those (per the strict admin/visitor
 * separation maintained since Prompt 4). Per
 * docs/05-frontend-architecture.md, Section 7: "the frontend is
 * architecturally forbidden from inventing its own permanent notion of
 * visitor progress independent of what the backend has recorded" — so
 * this store's unlocked-node state is explicitly LOCAL-ONLY,
 * session-lifetime (not even persisted to localStorage), and clearly
 * fictional: it exists purely so the World Map (Part 3) has something to
 * render locked/unlocked states against, and is DESIGNED to be deleted
 * and replaced with real React Query state the moment a future prompt
 * implements the Public Experience/Progress API (Prompt 4, Section 3)
 * and a real VisitorSession (Prompt 13's visitor_progress domain).
 *
 * Every location starts unlocked EXCEPT the Secret Room and Birthday
 * Castle, matching Part 3's "locked locations should appear mysterious"
 * — Game Zone is also excluded from this prompt's real content (Games
 * is a future domain) but is shown unlocked/visitable as an empty
 * "coming soon" node, not mysterious-locked, since there's no unlock
 * gate implied for it specifically.
 * ================================================================
 */
import { create } from "zustand";

export type WorldMapLocationId =
  | "memory-garden"
  | "timeline-train"
  | "love-letters"
  | "gallery"
  | "game-zone"
  | "birthday-castle"
  | "secret-room";

interface ProgressionState {
  unlockedLocations: Set<WorldMapLocationId>;
  isLocationUnlocked: (id: WorldMapLocationId) => boolean;
}

export const useProgressionStore = create<ProgressionState>((_, get) => ({ 
  unlockedLocations: new Set<WorldMapLocationId>([
    "memory-garden",
    "timeline-train",
    "love-letters",
    "gallery",
    "game-zone",
  ]),
  isLocationUnlocked: (id) => get().unlockedLocations.has(id),
}));
