/**
 * SceneTransition — wraps <Outlet/> (or route children) in
 * AnimatePresence so route changes cross-fade + drift per
 * docs/02-design-system.md, Section 7, rather than hard-cutting between
 * scenes ("no hard page reloads," Prompt 15 Part 2). Mounted once in
 * App.tsx's router tree.
 */
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

import { sceneTransition } from "@/animations/motionPrimitives";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SceneTransitionProps {
  children: ReactNode;
}

export default function SceneTransition({ children }: SceneTransitionProps) {
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className="w-full h-full"
        variants={reducedMotion ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : sceneTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
