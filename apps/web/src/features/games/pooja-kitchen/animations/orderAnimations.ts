/**
 * Shared Framer Motion + styling definitions for order "ticket" bubbles.
 */

import type { Variants } from 'framer-motion';

/** Pop-in/out animation for an OrderBubble mounting above a customer. */
export const orderBubbleVariants: Variants = {
  initial: { scale: 0.6, opacity: 0, y: 6 },
  animate: { scale: 1, opacity: 1, y: 0 },
  exit: { scale: 0.6, opacity: 0, y: 6 },
};

export const orderBubbleTransition = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 20,
};

/**
 * A ticket with a torn/zigzag bottom edge — the game's signature visual
 * detail, shared by any component that wants the same "receipt" shape.
 */
export const ticketClipPath =
  'polygon(0% 0%, 100% 0%, 100% 82%, 92% 100%, 84% 82%, 76% 100%, 68% 82%, 60% 100%, 52% 82%, 44% 100%, 36% 82%, 28% 100%, 20% 82%, 12% 100%, 4% 82%, 0% 100%)';
