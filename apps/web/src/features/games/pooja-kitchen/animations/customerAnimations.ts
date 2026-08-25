/**
 * Shared Framer Motion animation definitions for customer lifecycle
 * states (entering / waiting / happy / angry / leaving).
 *
 * Centralizing these here (rather than inline in components/Customer.tsx)
 * means the same "feel" can be reused anywhere else a customer needs to
 * animate (e.g. a future results screen replaying happy customers) and
 * keeps components/Customer.tsx focused on markup.
 */

import type { Variants } from 'framer-motion';

/** Slide/fade transitions between the five CustomerState values. */
export const customerContainerVariants: Variants = {

  entering: {
    x: 120,
    y: 20,
    opacity: 0,
  },

  waiting: {
    x: 0,
    y: 0,
    opacity: 1,
  },

  happy: {
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1.05,
  },

  angry: {
    x: 0,
    y: 0,
    opacity: 1,
  },

  leaving: {
    x: -120,
    y: 20,
    opacity: 0,
  },

};

export const customerContainerTransition = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 22,
};

/** Idle bobbing loop played while a customer is waiting patiently. */
export const customerWaitingBob = {

  animate:{
    y:[0,-5,0]
  },

  transition:{
    duration:1.8,
    repeat:Infinity,
    ease:'easeInOut' as const
  }

};

/** Short angry shake loop played once patience hits zero. */
export const customerAngryShake = {

 animate:{
   rotate:[0,-4,4,-4,0]
 },

 transition:{
   duration:0.35,
   repeat:Infinity,
   repeatDelay:0.8
 }

};
/** Resolves the correct avatar animation for the current customer state. */
export function resolveCustomerMotion(state: 'entering' | 'waiting' | 'happy' | 'angry' | 'leaving') {
  if (state === 'angry') return customerAngryShake;
  if (state === 'waiting') return customerWaitingBob;
  return { animate: { rotate: 0, y: 0 }, transition: { duration: 0.2 } };
}
