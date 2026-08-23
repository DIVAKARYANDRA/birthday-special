/**
 * Mock data used by poojaKitchenApi.ts while `USE_MOCK_DATA` is true.
 *
 * This file exists purely so the game engine can be developed and
 * demoed end-to-end before the backend is connected. It intentionally
 * mirrors the shape (and, for level 1, the actual content) of the
 * Alembic seed data on the backend so switching `USE_MOCK_DATA` off
 * later is a no-op for the UI.
 *
 * Delete this file once the real backend is live.
 */

import type { Level, PlayerProgress } from '../data/types';

const MOCK_THEME = {
  id: 'theme-pooja-love-cafe',
  name: "Pooja's Love Cafe",
  description:
    'A cozy first restaurant serving coffee, cake, and sandwiches.',
  backgroundImage: '', // ASSUMPTION: filled in by backend media pipeline
};

const MOCK_FOODS = [
  { id: 'food-coffee', name: 'Coffee', image: '', cookTime: 10, price: 15 },
  { id: 'food-cake', name: 'Cake', image: '', cookTime: 25, price: 30 },
  { id: 'food-sandwich', name: 'Sandwich', image: '', cookTime: 20, price: 25 },
];

const MOCK_STATIONS = [
  {
    id: 'station-brew-bar',
    name: 'Brew Bar',
    supportedFoodIds: ['food-coffee'],
    capacity: 2,
  },
  {
    id: 'station-oven',
    name: 'Oven',
    supportedFoodIds: ['food-cake', 'food-sandwich'],
    capacity: 1,
  },
];

const MOCK_CUSTOMERS = [
  {
    id: 'character-regular-1',
    name: 'Riya',
    avatar: '',
    happyAvatar: '',
    angryAvatar: '',
    patienceSeconds: 45,
  },
];

let mockPlayerProgress: PlayerProgress = {
  currentLevel: 1,
  highestUnlockedLevel: 1,
  coins: 0,
  totalScore: 0,
};

export function buildMockLevel(levelNumber: number): Level {
  return {
    id: `level-mock-${levelNumber}`,
    levelNumber,
    theme: MOCK_THEME,
    difficulty: 'easy',
    timeLimit: 60,
    targetScore: 100,
    customerCount: 1,
    stations: MOCK_STATIONS,
    foods: MOCK_FOODS,
    customers: MOCK_CUSTOMERS,
    orderTemplates: [
      {
        customerId: 'character-regular-1',
        lines: [{ foodId: 'food-coffee', quantity: 1 }],
        rewardPoints: 100,
      },
    ],
  };
}

export function buildMockProgress(): PlayerProgress {
  return { ...mockPlayerProgress };
}

export function buildMockCompleteLevelResult(payload: {
  levelNumber: number;
  score: number;
  ordersFulfilled: number;
  timeRemainingSeconds: number;
}) {
  const passed = payload.score >= 50;
  const coinsEarned = Math.round(payload.score * 0.5);

  mockPlayerProgress = {
    currentLevel: passed
      ? Math.max(mockPlayerProgress.currentLevel, payload.levelNumber)
      : mockPlayerProgress.currentLevel,
    highestUnlockedLevel: passed
      ? Math.max(
          mockPlayerProgress.highestUnlockedLevel,
          payload.levelNumber + 1
        )
      : mockPlayerProgress.highestUnlockedLevel,
    coins: mockPlayerProgress.coins + coinsEarned,
    totalScore: mockPlayerProgress.totalScore + payload.score,
  };

  return {
    levelNumber: payload.levelNumber,
    passed,
    firstClear: passed,
    coinsEarned,
    totalScoreEarned: payload.score,
    nextLevelUnlocked: passed ? payload.levelNumber + 1 : null,
    progress: { ...mockPlayerProgress },
  };
}
