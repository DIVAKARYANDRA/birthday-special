/**
 * useReducedMotion — the single, centralized check every animated
 * component defers to, per docs/05-frontend-architecture.md, Section 15
 * and docs/02-design-system.md, Section 14: ambient/heavy choreography
 * must swap to simpler fades when the visitor prefers reduced motion.
 *
 * Reads the OS-level `prefers-reduced-motion` media query. No manual
 * in-app override toggle exists yet (that would be a future Settings/UI
 * store addition) — this is the accessibility-driven signal only.
 */
import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReduced(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReduced;
}
