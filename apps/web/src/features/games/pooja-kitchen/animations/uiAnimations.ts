/**
 * Shared Framer Motion definitions for general-purpose UI chrome:
 * modal overlays, primary buttons, and cooking-station food items.
 */

import type { Variants } from 'framer-motion';

/** Fade for full-screen overlays (level intro, pause, results). */
export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Standard tap-down feedback used by every tappable game button. */
export const buttonTapAnimation = { scale: 0.95 };

/** Slightly stronger tap feedback for small icon-only food cards. */
export const foodCardTapAnimation = { scale: 0.92 };

/** Gentle bob loop played while a cooked food item is ready to collect. */
export const foodReadyBob = {
  animate: { y: [0, -3, 0] },
  transition: { duration: 0.9, repeat: Infinity },
};

export const foodIdleAnimation = { y: 0 };
