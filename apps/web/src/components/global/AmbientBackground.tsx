/**
 * AmbientBackground — the composed "world" behind every scene: gradient
 * sky, moon/glow, drifting clouds/aurora, and a ParticlesLayer variant.
 *
 * Per docs/01-system-architecture.md, Section 4: "SceneLayout owns
 * ambient/background animation; individual scenes never manage global
 * particles/aurora themselves." This component IS that shared ambient
 * layer, composed once per scene via `<SceneLayout>` (below), never
 * hand-rolled per scene.
 *
 * THEME ENGINE NOTE (Part 8): `mode` below is the day/night switch this
 * prompt implements structurally. Per
 * docs/05-frontend-architecture.md, Section 5, the FULL Theme Engine
 * (admin-authored Theme data resolved to CSS variables) is future work —
 * this component currently resolves `mode` to a small, hardcoded pair of
 * gradient/particle presets rather than reading admin Theme data (no
 * Public Experience API exists yet to deliver that data, per this
 * prompt's own scope note in progressionStore.ts). The `mode` prop is
 * deliberately the exact seam a future Theme Engine would plug into.
 */
import type { ReactNode } from "react";
import { motion } from "framer-motion";

import ParticlesLayer from "./ParticlesLayer";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_IN_OUT } from "@/animations/motionPrimitives";

export type AmbientMode = "night" | "twilight" | "dawn";

interface AmbientBackgroundProps {
  mode?: AmbientMode;
  showMoon?: boolean;
  showFireflies?: boolean;
  children?: ReactNode;
}

const GRADIENTS: Record<AmbientMode, string> = {
  night: "linear-gradient(180deg, #0a0716 0%, #14101f 45%, #1d1530 100%)",
  twilight: "linear-gradient(180deg, #1d1533 0%, #3a2456 45%, #5c3a72 100%)",
  dawn: "linear-gradient(180deg, #2c1f45 0%, #6b3f6e 45%, #c98a8f 100%)",
};

export default function AmbientBackground({
  mode = "night",
  showMoon = true,
  showFireflies = false,
  children,
}: AmbientBackgroundProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: GRADIENTS[mode] }}
    >
      {/* Stars — always present, the base ambient texture. */}
      <ParticlesLayer variant="stars" baseCount={90} />

      {/* Drifting aurora/cloud wash — soft, low-opacity, looping. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-1/4 top-0 h-1/2 opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 40% at 30% 20%, rgba(142,106,196,0.5), transparent), radial-gradient(50% 30% at 70% 10%, rgba(216,167,224,0.35), transparent)",
        }}
        animate={reducedMotion ? undefined : { x: ["-2%", "2%", "-2%"] }}
        transition={{ duration: 18, ease: EASE_IN_OUT, repeat: Infinity }}
      />

      {showMoon && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute right-[12%] top-[8%] h-16 w-16 rounded-full sm:h-20 sm:w-20"
          style={{
            background: "radial-gradient(circle at 35% 35%, #fffaf0, #f5d76e 55%, transparent 75%)",
            boxShadow: "0 0 40px 10px rgba(245, 215, 110, 0.35)",
          }}
          animate={reducedMotion ? undefined : { opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 6, ease: EASE_IN_OUT, repeat: Infinity }}
        />
      )}

      {showFireflies && <ParticlesLayer variant="fireflies" baseCount={22} />}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
