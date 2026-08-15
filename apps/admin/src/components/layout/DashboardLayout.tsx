/**
 * Admin app shell — fixed sidebar navigation + content outlet, per
 * docs/05-frontend-architecture.md, Section 3: "a fixed, icon+label
 * navigation mirroring the module list." Structure-focused per Prompt
 * 14, Part 6 ("focus on structure and data flow, polish can come
 * later") — inline styles only, no design-token/Tailwind application
 * yet (that's Design System integration work for a future prompt, per
 * docs/02-design-system.md, Section 15's restrained admin treatment).
 */
import type { CSSProperties } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard" },
  { to: "/media", label: "Media" },
  { to: "/music", label: "Music" },
  { to: "/memories", label: "Memories" },
  { to: "/timeline", label: "Timeline" },
  { to: "/letters", label: "Letters" },
  { to: "/quotes", label: "Quotes" },
  { to: "/achievements", label: "Achievements" },
  { to: "/unlocks", label: "Unlock Conditions" },
  
];

const linkStyle = (isActive: boolean): CSSProperties => ({
  display: "block",
  padding: "0.5rem 1rem",
  color: isActive ? "#fff" : "#ccc",
  background: isActive ? "#4b2e83" : "transparent",
  textDecoration: "none",
  borderRadius: "0.5rem",
  marginBottom: "0.25rem",
});

export default function DashboardLayout() {
  const { adminUser, logout } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <aside style={{ width: 220, background: "#14101f", padding: "1rem", color: "#fff" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "1.5rem" }}>Journey Admin</h2>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} style={({ isActive }) => linkStyle(isActive)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: "2rem", borderTop: "1px solid #333", paddingTop: "1rem", fontSize: "0.85rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>{adminUser?.username ?? "Admin"}</div>
          <button onClick={() => logout()} style={{ background: "none", border: "1px solid #555", color: "#ccc", padding: "0.4rem 0.75rem", borderRadius: "0.4rem", cursor: "pointer" }}>
            Log out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: "2rem", background: "#f7f5fa" }}>
        <Outlet />
      </main>
    </div>
  );
}
