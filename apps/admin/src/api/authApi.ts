/**
 * Auth API module — wraps the public /api/v1/auth/* endpoints
 * (app.domains.auth.router, Prompt 14). Public in the sense that no
 * access token is required for these three calls specifically (they're
 * how one is obtained/exchanged/revoked) — everything else in src/api/
 * requires an authenticated session via client.ts's token injection.
 */
import { apiRequest } from "./client";

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<TokenResponse>("/api/v1/auth/login", { method: "POST", body: { username, password } }),

  refresh: (refresh_token: string) =>
    apiRequest<TokenResponse>("/api/v1/auth/refresh", { method: "POST", body: { refresh_token } }),

  logout: (refresh_token: string) =>
    apiRequest<void>("/api/v1/auth/logout", { method: "POST", body: { refresh_token } }),
};
