/**
 * BottomNav — the mobile-first primary navigation, per Prompt 15, Part 4
 * and docs/02-design-system.md, Section 13: "Navigation... Simplified/
 * compact... or list-style scene picker fallback" for mobile.
 *
 * Fixed to the viewport bottom, safe-area aware (`env(safe-area-inset-bottom)`,
 * Part 10), large touch targets (min 44px per side, per accessibility/
 * touch-target guidance), tap-first (no hover-dependent affordance).
 * Desktop keeps the same bottom bar rather than switching to a top nav —
 * per Prompt 15's "desktop is secondary," this app does not maintain two
 * separate navigation implementations; the bottom bar simply centers
 * itself and stays comfortably usable at larger widths too.
 */
import { NavLink } from "react-router-dom";

const NAV_ITEMS: { to: string; label: string; emoji: string }[] = [
  { to: "/world", label: "Map", emoji: "🗺️" },
  { to: "/memories", label: "Memories", emoji: "🌸" },
  { to: "/timeline", label: "Timeline", emoji: "🚂" },
  { to: "/gallery", label: "Gallery", emoji: "📷" },
  { to: "/letters", label: "Letters", emoji: "💌" },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center border-t border-white/10 bg-[#14101f]/90 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary navigation"
    >
      <ul className="flex w-full max-w-md justify-between px-2">
        {NAV_ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex min-h-[44px] flex-col items-center justify-center gap-0.5 py-2 text-[11px] transition-colors ${
                  isActive ? "text-accent" : "text-white/60"
                }`
              }
            >
              <span aria-hidden="true" className="text-lg leading-none">
                {item.emoji}
              </span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
