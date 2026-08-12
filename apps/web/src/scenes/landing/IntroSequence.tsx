/**
 * IntroSequence — Part 2. A brief, largely non-interactive choreographed
 * sequence establishing tone before the World Map, per
 * docs/05-frontend-architecture.md, Section 2: "transitions the visitor
 * into the World Map on completion or skip."
 *
 * "Book opening animation": two panels ("covers") scale/rotate open from
 * center, revealing "Our Story" title text, then auto-advance. Built with
 * Framer Motion (not GSAP) since it's a single, declarative, one-shot
 * sequence — per docs/05-frontend-architecture.md, Section 10's tool
 * guidance ("GSAP... where a sequence needs to be authored as a single
 * coordinated timeline" is the bar for reaching past Framer Motion; this
 * sequence is simple enough that Framer Motion's own `useEffect`-driven
 * multi-stage variants suffice without GSAP's added complexity here).
 *
 * Skippable (tap anywhere) — per Section 2, a returning visitor's
 * JourneyProgressLog would normally decide whether to skip this
 * automatically, but that requires the not-yet-implemented Public
 * Experience API (see docs/15-public-experience-foundation-status.md);
 * for now, every visit shows the intro once per session
 * (uiStore-tracked) and offers a manual skip.
 *
 * "No hard page reloads": this is a route (`/intro`) reached via
 * client-side navigation from Landing and exits via client-side
 * navigation to `/world` — SceneTransition (mounted once in App.tsx)
 * handles the cross-fade on both ends automatically.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import AmbientBackground from "@/components/global/AmbientBackground";
import { EASE_OUT } from "@/animations/motionPrimitives";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const AUTO_ADVANCE_MS = 3200;

export default function IntroSequence() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState<"closed" | "opening" | "revealed">("closed");

  useEffect(() => {
    const openTimer = setTimeout(() => setStage("opening"), reducedMotion ? 0 : 300);
    const revealTimer = setTimeout(() => setStage("revealed"), reducedMotion ? 100 : 1200);
    const advanceTimer = setTimeout(() => navigate("/world"), AUTO_ADVANCE_MS);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(revealTimer);
      clearTimeout(advanceTimer);
    };
  }, [navigate, reducedMotion]);

  return (
    <AmbientBackground mode="twilight">
      <button
        onClick={() => navigate("/world")}
        className="flex min-h-screen w-full flex-col items-center justify-center px-6 text-center"
        aria-label="Skip intro"
      >
        <div className="relative flex h-56 w-full max-w-xs items-center justify-center">
          {/* Left "cover" */}
          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-full w-1/2 origin-left rounded-l-lg bg-gradient-to-br from-[#3a2456] to-[#1d1533] shadow-xl"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: stage === "closed" ? 0 : -140 }}
            transition={{ duration: 1, ease: EASE_OUT }}
            style={{ transformStyle: "preserve-3d" }}
          />
          {/* Right "cover" */}
          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-full w-1/2 origin-left rounded-r-lg bg-gradient-to-bl from-[#3a2456] to-[#1d1533] shadow-xl"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: stage === "closed" ? 0 : 140 }}
            transition={{ duration: 1, ease: EASE_OUT }}
            style={{ transformStyle: "preserve-3d" }}
          />

          {stage === "revealed" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="relative z-10 px-4"
            >
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/50">Chapter One</p>
              <h2 className="font-display text-2xl text-white">Our Story</h2>
            </motion.div>
          )}
        </div>
        <p className="mt-10 text-xs text-white/40">Tap to continue</p>
      </button>
    </AmbientBackground>
  );
}
