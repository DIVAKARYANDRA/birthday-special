/**
 * API client for Pooja Kitchen.
 *
 * Handles:
 * - authenticated API requests
 * - automatic access-token refresh
 * - retrying the original request after refresh
 * - level loading
 * - player progress
 * - level completion
 */

import type {
  Level,
  PlayerProgress,
} from "../data/types";

import {
  getAuthToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens,
} from "./authToken";


const API_BASE_URL =
  `${
    import.meta.env.VITE_API_BASE_URL ??
    "https://journey-to-my-heart-api.onrender.com"
  }/api/v1/games/pooja-kitchen`;


/**
 * Mock data remains disabled because the real backend is being used.
 */
const USE_MOCK_DATA = false;


/**
 * Prevent multiple simultaneous API requests from attempting to
 * refresh the token at the same time.
 */
let refreshPromise: Promise<string | null> | null = null;


interface RefreshResponse {

  access_token: string;

  refresh_token: string;

  token_type: string;

}


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


/**
 * Refresh the Pooja Kitchen access token.
 *
 * The backend rotates both tokens, so both the new access token and
 * new refresh token must be stored.
 */
async function refreshAccessToken(): Promise<string | null> {

  const refreshToken =
    getRefreshToken();


  if (!refreshToken) {

    console.warn(
      "[PoojaKitchen Auth] No refresh token available."
    );

    return null;

  }


  try {

    console.log(
      "[PoojaKitchen Auth] Refreshing access token..."
    );


    const response =
      await fetch(
        `${API_BASE_URL}/auth/refresh`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            refresh_token:
              refreshToken,
          }),
        }
      );


    console.log(
      "[PoojaKitchen Auth] Refresh response:",
      response.status
    );


    if (!response.ok) {

      console.error(
        "[PoojaKitchen Auth] Refresh failed:",
        response.status
      );

      clearAuthTokens();

      return null;

    }


    const data =
      (await response.json()) as RefreshResponse;


    if (
      !data.access_token ||
      !data.refresh_token
    ) {

      console.error(
        "[PoojaKitchen Auth] Refresh response missing tokens."
      );

      clearAuthTokens();

      return null;

    }


    setAuthTokens(
      data.access_token,
      data.refresh_token
    );


    console.log(
      "[PoojaKitchen Auth] Token refresh successful."
    );


    return data.access_token;


  } catch (error) {

    console.error(
      "[PoojaKitchen Auth] Token refresh request failed:",
      error
    );

    return null;

  }

}


/**
 * Ensures only one refresh request is running at a time.
 *
 * This is important because multiple API calls can happen close together.
 * Without this guard, several requests could all try to rotate the same
 * refresh token simultaneously.
 */
function getRefreshedAccessToken(): Promise<string | null> {

  if (!refreshPromise) {

    refreshPromise =
      refreshAccessToken()
        .finally(() => {

          refreshPromise = null;

        });

  }

  return refreshPromise;

}


/**
 * Perform an authenticated API request.
 *
 * If the access token has expired:
 *
 * 1. Original request receives 401.
 * 2. Refresh token is used.
 * 3. New access + refresh tokens are stored.
 * 4. Original request is automatically retried once.
 */
async function requestJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {


  async function performRequest(
    token: string | null
  ): Promise<Response> {

    console.log(
      "[PoojaKitchen API] Request:",
      path,
      "Token exists:",
      !!token
    );


    return fetch(
      `${API_BASE_URL}${path}`,
      {
        ...init,

        headers: {

          "Content-Type":
            "application/json",

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

  }


  let token =
    getAuthToken();


  let response =
    await performRequest(token);


  console.log(
    "[PoojaKitchen API] Response:",
    path,
    response.status
  );


  /**
   * Access token expired.
   *
   * Attempt exactly one refresh and then retry the original request.
   */
  if (
    response.status === 401 &&
    token
  ) {

    console.warn(
      "[PoojaKitchen API] Access token rejected. Attempting refresh..."
    );


    const newToken =
      await getRefreshedAccessToken();


    if (newToken) {

      token =
        newToken;


      response =
        await performRequest(
          token
        );


      console.log(
        "[PoojaKitchen API] Retried request:",
        path,
        response.status
      );

    }

  }


  /**
   * If the request is still unauthorized after refresh,
   * the session is genuinely invalid/expired.
   */
  if (response.status === 401) {

    throw new Error(
      "Pooja Kitchen session expired. Please log in again."
    );

  }


  if (!response.ok) {

    throw new Error(
      `Pooja Kitchen API request failed: ${response.status} ${response.statusText}`
    );

  }


  return (
    await response.json()
  ) as T;

}


/**
 * Fetch the full definition for a single level.
 */
export async function getLevel(
  levelNumber: number
): Promise<Level> {


  if (USE_MOCK_DATA) {

    const {
      buildMockLevel,
    } =
      await import(
        "./mockData"
      );


    return buildMockLevel(
      levelNumber
    );

  }


  return requestJson<Level>(
    `/levels/${levelNumber}`
  );

}


/**
 * Fetch current player's saved progress.
 */
export async function getPlayerProgress():
  Promise<PlayerProgress> {


  if (USE_MOCK_DATA) {

    const {
      buildMockProgress,
    } =
      await import(
        "./mockData"
      );


    return buildMockProgress();

  }


  const state =
    await requestJson<{
      progress: PlayerProgress;
    }>(
      "/game-state"
    );


  return state.progress;

}


/**
 * Report the result of a finished level.
 */
export async function completeLevel(
  payload: CompleteLevelPayload
): Promise<CompleteLevelResult> {


  if (USE_MOCK_DATA) {

    const {
      buildMockCompleteLevelResult,
    } =
      await import(
        "./mockData"
      );


    return buildMockCompleteLevelResult(
      payload
    );

  }


  return requestJson<CompleteLevelResult>(
    "/complete-level",
    {
      method: "POST",

      body:
        JSON.stringify(
          payload
        ),
    }
  );

}