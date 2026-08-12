/**
 * Dashboard landing view — per docs/05-frontend-architecture.md,
 * Section 3: "overview cards... acting as a launch point into each
 * module." Structure-only per Prompt 14, Part 6 — links to each of the
 * 7 management screens, no live counts/analytics yet (that's a future
 * prompt, once app.domains.analytics is implemented).
 */
import { Link } from "react-router-dom";

const MODULES = [
  { to: "/media", label: "Media", description: "Photos, videos, audio, documents, animations" },
  { to: "/memories", label: "Memories", description: "The central storytelling entity" },
  { to: "/timeline", label: "Timeline", description: "Story Book, Train Journey, and other presentations" },
  { to: "/letters", label: "Letters", description: "Love letters and secret messages" },
  { to: "/quotes", label: "Quotes", description: "Categorized, prioritized, contextual quotes" },
  { to: "/achievements", label: "Achievements", description: "Definitions and visitor progress" },
  { to: "/unlocks", label: "Unlock Conditions", description: "The universal gating engine" },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
        {MODULES.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            style={{
              display: "block",
              padding: "1.25rem",
              background: "#fff",
              borderRadius: "0.75rem",
              textDecoration: "none",
              color: "#222",
              border: "1px solid #e5e0ee",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{m.label}</div>
            <div style={{ fontSize: "0.85rem", color: "#666" }}>{m.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
