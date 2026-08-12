/**
 * The animation orchestration layer, per
 * docs/05-frontend-architecture.md, Section 5/10: reusable Framer Motion
 * variants — the ONLY sanctioned way components request "standard"
 * motion. Durations/easing match docs/02-design-system.md, Section 7's
 * guideline bands exactly:
 *   Micro-interactions 100-250ms · Standard UI motion 250-500ms ·
 *   Scene choreography 600ms-1.5s · Celebration 1.5-3s
 * Default ease-out for entrances, ease-in-out for looping/ambient motion,
 * per that same section.
 */
import type { Transition, Variants } from "framer-motion";

export const EASE_OUT: Transition["ease"] = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT: Transition["ease"] = [0.45, 0, 0.55, 1];

/** Standard entrance for cards, panels, and list items — per
 * docs/05-frontend-architecture.md, Section 5's fadeInUp primitive. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: EASE_OUT } },
};

/** Staggers a list of fadeInUp children — used by grids of cards
 * (memory cards, world map nodes) so nothing appears all at once, per
 * docs/02-design-system.md, Section 7's "object entrance... staggered
 * for groups of elements." */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/** Full scene choreography — used for scene-level route transitions
 * (SceneTransition.tsx). Cross-fade + soft directional drift, per
 * docs/02-design-system.md, Section 7: "never a hard cut or jarring
 * slide." */
export const sceneTransition: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.5, ease: EASE_OUT } },
};

/** Gentle ambient float loop — idle-state embellishment (fireflies,
 * floating polaroids' idle sway). Ease-in-out, per the looping-motion
 * guideline. */
export const floatLoop: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 4, ease: EASE_IN_OUT, repeat: Infinity },
  },
};

/** Reward/unlock burst — reserved for genuinely celebratory moments
 * (Part 3's "unlocked locations should animate"), per
 * docs/02-design-system.md, Section 7: spring/overshoot reserved for
 * reward moments only. */
export const unlockBurst: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 18 },
  },
};

/** Button/tap micro-interaction — 100-250ms band. */
export const tapScale = { scale: 0.96 };

/**
 * Resolves a variants object down to its simplest (opacity-only) form
 * when reduced motion is preferred, per
 * docs/05-frontend-architecture.md, Section 10/15. Every scene-level
 * animated component should pass its variants through this rather than
 * using the raw export directly whenever `useReducedMotion()` is true.
 */
export function withReducedMotion(variants: Variants, reduced: boolean): Variants {
  if (!reduced) return variants;
  const flattened: Variants = {};
  for (const key of Object.keys(variants)) {
    flattened[key] = { opacity: key === "hidden" || key === "initial" || key === "exit" ? 0 : 1 };
  }
  return flattened;
}
