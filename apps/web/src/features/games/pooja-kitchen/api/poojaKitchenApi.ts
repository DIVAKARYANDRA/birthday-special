/**
 * Placeholder API client for Pooja Kitchen.
 *
 * These functions are the ONLY integration point between the game engine
 * and the backend. Endpoint paths mirror the FastAPI router
 * (`/api/pooja-kitchen/...`) so wiring up real data later is a matter of
 * removing the mock branches below — nothing else in the engine, hook,
 * or components needs to change.
 *
 * No authentication UI, request signing, or error-recovery lives here on
 * purpose: this is a thin data-fetching seam, not a backend client
 * library. The one exception is the Authorization header below, which
 * reads from api/authToken.ts — that module is a placeholder seam for
 * whatever the app's real login flow turns out to be, not an auth
 * implementation itself.
 */

import type { Level, PlayerProgress } from '../data/types';
import { getAuthToken } from './authToken';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? "https://journey-to-my-heart-api.onrender.com"}/api/v1/games/pooja-kitchen`;

/** Toggle to false once the real backend endpoints are live. */
const USE_MOCK_DATA = false;

interface CompleteLevelPayload {
  levelNumber: number;
  score: number;
  ordersFulfilled: number;
  timeRemainingSeconds: number;
}

interface CompleteLevelResult {
  levelNumber: number;
  passed: boolean;
  firstClear: boolean;
  coinsEarned: number;
  totalScoreEarned: number;
  nextLevelUnlocked: number | null;
  progress: PlayerProgress;
}

async function requestJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {

  const token = getAuthToken();

  console.log(
    "[PoojaKitchen API] Request:",
    path,
    "Token exists:",
    !!token
  );

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...init,

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),

        ...(init?.headers ?? {}),
      },
    }
  );

  console.log(
    "[PoojaKitchen API] Response:",
    path,
    response.status
  );

  // rest unchanged...

  if (response.status === 401) {
    throw new Error(
      'Pooja Kitchen API request failed: 401 Unauthorized — the session token is missing or expired.'
    );
  }

  if (!response.ok) {
    throw new Error(
      `Pooja Kitchen API request failed: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as T;
}

/**
 * Fetch the full definition for a single level (theme, stations, foods,
 * customers, and order templates).
 */
export async function getLevel(levelNumber: number): Promise<Level> {
  if (USE_MOCK_DATA) {
    const { buildMockLevel } = await import('./mockData');
    return buildMockLevel(levelNumber);
  }
  return requestJson<Level>(`/levels/${levelNumber}`);
}

/**
 * Fetch the current player's saved progress (current level, unlocks,
 * coins, total score).
 */
export async function getPlayerProgress(): Promise<PlayerProgress> {
  if (USE_MOCK_DATA) {
    const { buildMockProgress } = await import('./mockData');
    return buildMockProgress();
  }
  const state = await requestJson<{ progress: PlayerProgress }>('/game-state');
  return state.progress;
}

/**
 * Report the outcome of a finished level attempt and receive the
 * updated progress + reward breakdown back.
 */
export async function completeLevel(
  payload: CompleteLevelPayload
): Promise<CompleteLevelResult> {
  if (USE_MOCK_DATA) {
    const { buildMockCompleteLevelResult } = await import('./mockData');
    return buildMockCompleteLevelResult(payload);
  }
  return requestJson<CompleteLevelResult>('/complete-level', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
