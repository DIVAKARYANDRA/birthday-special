/**
 * useAuth — the single hook feature code uses to interact with admin
 * authentication, wrapping authStore + authApi so components never call
 * either directly, per docs/05-frontend-architecture.md, Section 1's
 * hooks-as-the-bridge-between-components-and-state/services pattern.
 */
import { useCallback } from "react";

import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const adminUser = useAuthStore((s) => s.adminUser);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  const login = useCallback(
    async (username: string, password: string) => {
      const tokens = await authApi.login(username, password);
      setSession(tokens.access_token, tokens.refresh_token);
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    const refreshToken = useAuthStore.getState().getStoredRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Logout is best-effort client-side regardless of server outcome
        // — the session is cleared locally either way.
      }
    }
    clearSession();
  }, [clearSession]);

  return {
    accessToken,
    adminUser,
    isHydrating,
    isAuthenticated: accessToken !== null,
    login,
    logout,
  };
}
