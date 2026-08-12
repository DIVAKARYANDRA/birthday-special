/**
 * useBreakpoint — the shared behavioral (not just CSS) responsive hook
 * described in docs/05-frontend-architecture.md, Section 14: "behavioral
 * differences (which interaction model, which animation tier) — not just
 * layout — respond consistently to device context."
 *
 * MOBILE-FIRST, per Prompt 15's most important requirement: the design
 * baseline is 375px (a standard small-phone portrait width); breakpoints
 * name what's ABOVE that baseline, never treat mobile as the exception.
 * Values mirror Tailwind's own default breakpoint scale so this hook's
 * notion of "tablet"/"desktop" matches whatever `md:`/`lg:` classes
 * elsewhere in this app already assume.
 */
import { useEffect, useState } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

const TABLET_MIN = 768; // Tailwind's `md`
const DESKTOP_MIN = 1024; // Tailwind's `lg`

function resolveBreakpoint(width: number): Breakpoint {
  if (width >= DESKTOP_MIN) return "desktop";
  if (width >= TABLET_MIN) return "tablet";
  return "mobile";
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() =>
    typeof window !== "undefined" ? resolveBreakpoint(window.innerWidth) : "mobile",
  );

  useEffect(() => {
    function handleResize() {
      setBreakpoint(resolveBreakpoint(window.innerWidth));
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}
