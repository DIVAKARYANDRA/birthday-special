/**
 * Admin login page — the standalone entry point described in
 * docs/05-frontend-architecture.md, Section 3: "not part of the main app
 * shell, rendered before any protected layout mounts." On success,
 * useAuth.login() stores the token pair and App.tsx's route redirect
 * (via ProtectedRoute) sends the admin to the dashboard.
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { ApiError } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    navigate("/", { replace: true });
    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#14101f" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "2.5rem", borderRadius: "0.75rem", width: 320 }}>
        <h1 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>Journey To My Heart — Admin</h1>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.4rem", border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "1rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.4rem", border: "1px solid #ccc" }}
          />
        </label>

        {error && <p style={{ color: "#b3261e", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{ width: "100%", padding: "0.6rem", borderRadius: "0.4rem", border: "none", background: "#4b2e83", color: "#fff", cursor: "pointer" }}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
