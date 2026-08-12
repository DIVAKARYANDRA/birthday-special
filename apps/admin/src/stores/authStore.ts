/**
 * Admin authentication state — Zustand store.
 *
 * Per docs/05-frontend-architecture.md, Section 6: client/interaction
 * state only, never a duplicate source of truth for anything the backend
 * tracks. Here, the backend-issued tokens themselves ARE the state this
 * store holds (there's no separate "real" copy on the server to
 * duplicate) — this is the one legitimate case for state living
 * client-side as the primary record, since a JWT is inherently a
 * client-held credential.
 *
 * The refresh token is persisted to localStorage (surviving a page
 * reload) so the admin isn't forced to log in again on every refresh;
 * the access token is kept in memory only, re-derived via a refresh call
 * on app load if a stored refresh token exists. Per
 * docs/05-frontend-architecture.md, Section 17: this is a UX convenience,
 * not a security boundary — actual protection is enforced server-side by
 * every Admin Content API's require_permission dependency
 * (app.domains.auth.dependencies, Prompt 14), never by this store.
 */
import { create } from "zustand";

const REFRESH_TOKEN_STORAGE_KEY = "journey_admin_refresh_token";

interface AdminUserSummary {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  adminUser: AdminUserSummary | null;
  isHydrating: boolean;
  setSession: (accessToken: string, refreshToken: string, adminUser?: AdminUserSummary | null) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
  getStoredRefreshToken: () => string | null;
  setHydrating: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  adminUser: null,
  isHydrating: true,

  setSession: (accessToken, refreshToken, adminUser = null) => {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    set({ accessToken, adminUser, isHydrating: false });
  },

  setAccessToken: (accessToken) => set({ accessToken }),

  clearSession: () => {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    set({ accessToken: null, adminUser: null, isHydrating: false });
  },

  getStoredRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY),

  setHydrating: (value) => set({ isHydrating: value }),
}));
