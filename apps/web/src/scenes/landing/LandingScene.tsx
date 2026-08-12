/**
 * LandingScene — Part 1. The visitor's first, deliberately minimal
 * screen, per docs/01-system-architecture.md, Section 2: "a single
 * glowing point of interaction invites the first tap; restraint builds
 * intrigue." Night sky + stars + moon + fireflies + the "Begin" button.
 *
 * MOBILE-FIRST: content is centered in a single column sized for a
 * 375px viewport by default (no `sm:`/`md:` overrides needed for the
 * core layout — it already reads correctly at any width because it's
 * simply centered, per Prompt 15's "everything scales upward" mandate).
 *
 * "Smooth loading sequence" (Part 1): a brief staged reveal (title fades
 * in, then the button) rather than everything appearing at once —
 * implemented with motionPrimitives' staggerContainer/fadeInUp, not a
 * real asset-loading gate (no heavy assets are fetched by this scene).
 *
 * Tapping Begin marks `hasEnteredExperience` (uiStore) — this is what
 * satisfies "background music support" per Part 1: the mute toggle
 * becomes available and audio playback (once real audio assets exist,
 * future prompt) is gated behind this same first-gesture requirement,
 * per docs/05-frontend-architecture.md, Section 13's autoplay-safety
 * rule. No actual audio file is wired yet — see this doc's Remaining
 * Exclusions.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import AmbientBackground from "@/components/global/AmbientBackground";
import MagicButton from "@/components/ui/MagicButton";
import { fadeInUp, staggerContainer } from "@/animations/motionPrimitives";
import { useUIStore } from "@/stores/uiStore";

export default function LandingScene() {
  const navigate = useNavigate();
  const setEnteredExperience = useUIStore((s) => s.setEnteredExperience);
  const isMuted = useUIStore((s) => s.isMuted);
  const toggleMuted = useUIStore((s) => s.toggleMuted);

  function handleBegin() {
    setEnteredExperience(true);
    navigate("/intro");
  }

  return (
    <AmbientBackground mode="night" showFireflies>
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-8"
        >
          <motion.p variants={fadeInUp} className="text-sm uppercase tracking-[0.3em] text-white/50">
            A gift, just for you
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            className="font-display text-3xl leading-tight text-white sm:text-4xl"
          >
            The Journey
            <br />
            To My Heart
          </motion.h1>
          <motion.div variants={fadeInUp}>
            <MagicButton onClick={handleBegin}>Begin ✨</MagicButton>
          </motion.div>
        </motion.div>
      </div>

      <button
        onClick={toggleMuted}
        aria-label={isMuted ? "Unmute background music" : "Mute background music"}
        className="fixed right-4 top-4 z-20 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-lg text-white backdrop-blur-sm active:scale-90"
        style={{ top: "calc(1rem + env(safe-area-inset-top))" }}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
    </AmbientBackground>
  );
}
