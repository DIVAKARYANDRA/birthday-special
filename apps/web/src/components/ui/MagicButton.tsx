/**
 * MagicButton — the primary CTA button (the Landing scene's "Begin,"
 * and any future primary action), per docs/02-design-system.md,
 * Section 4: "pill or soft-rounded rect... glowing edge; primary buttons
 * carry a subtle idle breathing glow pulse to invite interaction."
 *
 * Touch-first: min 48px tall (comfortably above the 44px minimum touch
 * target), `active:scale-95` gives immediate tap feedback without
 * depending on `:hover` (Prompt 15's "avoid hover-only interactions").
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MagicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function MagicButton({ children, className = "", ...rest }: MagicButtonProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      {...rest}
      whileTap={{ scale: 0.95 }}
      animate={reducedMotion ? undefined : { boxShadow: ["0 0 20px 4px rgba(142,106,196,0.35)", "0 0 32px 8px rgba(142,106,196,0.55)", "0 0 20px 4px rgba(142,106,196,0.35)"] }}
      transition={reducedMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      className={`min-h-[48px] rounded-full bg-primary px-8 py-3 text-base font-medium text-white active:scale-95 ${className}`}
    >
      {children}
    </motion.button>
  );
}
