/**
 * Level progression configuration.
 *
 * The backend is the source of truth for actual level content (see
 * api/poojaKitchenApi.ts#getLevel) — this file does NOT define levels.
 * What it defines is the *shape* of how the frontend expects difficulty
 * and theming to scale across 200+ levels, so that:
 *
 *   1. UI that needs to reason about a level before/without fetching it
 *      (e.g. a future level-select map) can predict its theme/difficulty
 *      band from just a level number.
 *   2. Mock data generation (api/mockData.ts) can produce plausible
 *      levels for any level number during frontend-only development.
 *
 * If the backend's actual progression curve ever diverges from this,
 * the backend response always wins — these helpers are only ever used
 * as a fallback/prediction, never to override fetched level data.
 */

import type { Difficulty } from './types';

/** How many consecutive levels share the same theme before rotating. */
export const LEVELS_PER_THEME = 20;

/** How many consecutive levels share the same difficulty tier. */
export const LEVELS_PER_DIFFICULTY_STEP = 10;

export const DIFFICULTY_PROGRESSION: readonly Difficulty[] = [
  'easy',
  'easy',
  'medium',
  'medium',
  'hard',
  'hard',
  'hard',
  'expert',
];

/** Theme ids/names cycled through as level number increases. Backend
 * media/description content is authoritative; this only orders them. */
export interface ThemeSlot {
  id: string;
  name: string;
}

export const THEME_ROTATION: readonly ThemeSlot[] = [
  { id: 'theme-pooja-love-cafe', name: "Pooja's Love Cafe" },
  { id: 'theme-divakar-diner', name: "Divakar's Diner" },
  { id: 'theme-spice-street', name: 'Spice Street Stall' },
  { id: 'theme-sweet-corner', name: 'Sweet Corner Bakery' },
];

/** Predicts which difficulty tier a given level number falls into. */
export function getDifficultyForLevel(levelNumber: number): Difficulty {
  const stepIndex = Math.floor(
    ((levelNumber - 1) % (LEVELS_PER_DIFFICULTY_STEP * DIFFICULTY_PROGRESSION.length)) /
      LEVELS_PER_DIFFICULTY_STEP
  );
  return DIFFICULTY_PROGRESSION[stepIndex] ?? 'expert';
}

/** Predicts which theme slot a given level number belongs to. */
export function getThemeSlotForLevel(levelNumber: number): ThemeSlot {
  const themeIndex =
    Math.floor((levelNumber - 1) / LEVELS_PER_THEME) % THEME_ROTATION.length;
  return THEME_ROTATION[themeIndex];
}

/**
 * Scales base level tunables (time limit, target score, customer count)
 * up as the level number increases, so mock/dev levels feel like they're
 * part of a real 200-level curve rather than all being identical to
 * level 1.
 */
export function getScaledLevelTunables(levelNumber: number): {
  timeLimit: number;
  targetScore: number;
  customerCount: number;
} {
  const difficulty = getDifficultyForLevel(levelNumber);
  const difficultyMultiplier: Record<Difficulty, number> = {
    easy: 1,
    medium: 1.4,
    hard: 1.8,
    expert: 2.3,
  };

  const multiplier = difficultyMultiplier[difficulty];
  const growth = Math.min(levelNumber / 200, 1); // caps growth by level 200

  return {
    timeLimit: Math.round(60 + growth * 60 * multiplier),
    targetScore: Math.round(100 * multiplier + growth * 200),
    customerCount: Math.min(1 + Math.floor(growth * 5 * multiplier), 8),
  };
}
