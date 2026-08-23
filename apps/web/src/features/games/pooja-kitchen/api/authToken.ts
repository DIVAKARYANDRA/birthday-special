/**
 * Auth token holder.
 *
 * Pooja Kitchen's frontend game engine explicitly does NOT implement
 * login/authentication UI (see the backend module's `/login` endpoint
 * for that). This file is only the integration *seam*: wherever the
 * app's real auth flow lives, it should call `setAuthToken()` after a
 * successful login (and `clearAuthToken()` on logout) so that
 * poojaKitchenApi.ts can attach the token to every request.
 *
 * In-memory only, by design — this module does not decide where the
 * token is persisted (localStorage, a cookie, a native secure store,
 * etc.). That decision belongs to whatever owns authentication.
 */

let currentToken: string | null = null;

export function setAuthToken(token: string | null): void {
  currentToken = token;
}

export function getAuthToken(): string | null {
  return currentToken;
}

export function clearAuthToken(): void {
  currentToken = null;
}
