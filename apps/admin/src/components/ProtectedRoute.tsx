/**
 * Route protection guard — the layout-level guard described in
 * docs/05-frontend-architecture.md, Section 9: checks auth state BEFORE
 * rendering children, redirecting to /login rather than scattering
 * per-page checks. Mirrors the User Website's equivalent progression-gate
 * guard pattern, applied here to admin authentication instead.
 *
 * `isHydrating` (authStore) covers the brief window while App.tsx
 * attempts a silent token refresh from a stored refresh token on first
 * load — rendering nothing (or a minimal loading state) rather than
 * flashing a redirect-to-login before hydration has had a chance to
 * restore a valid session.
 */
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, isHydrating } = useAuth();

  if (isHydrating) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
