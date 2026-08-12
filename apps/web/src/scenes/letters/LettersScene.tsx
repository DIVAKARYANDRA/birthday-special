/**
 * LettersScene — MINIMAL, per this prompt's exclusion of "Unlock logic."
 * "Love Letters" is listed as an already-unlocked World Map location
 * (Part 3) and reachable from BottomNav, so it needs a real destination
 * scene — but the actual envelope-opening / password-unlock interaction
 * (docs/02-design-system.md, Section 4's "envelope-and-wax-seal opening
 * interaction") is deliberately NOT built here, since that depends on
 * the Unlock Engine integration (Prompt 13's backend logic) this
 * prompt's exclusions explicitly defer. This is a visual placeholder —
 * envelope silhouettes only, non-interactive — establishing the scene's
 * presence in the navigation/routing structure for a future prompt to
 * fill in.
 */
import SceneLayout from "@/components/global/SceneLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { staggerContainer, fadeInUp } from "@/animations/motionPrimitives";
import { motion } from "framer-motion";

const ENVELOPE_COUNT = 3;

export default function LettersScene() {
  return (
    <SceneLayout mode="dawn">
      <Breadcrumb label="Love Letters" />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-4">
          {Array.from({ length: ENVELOPE_COUNT }).map((_, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="flex h-16 w-56 items-center justify-center rounded-md border border-white/15 bg-white/[0.06] text-2xl opacity-70"
            >
              <span aria-hidden="true">💌</span>
            </motion.div>
          ))}
        </motion.div>
        <p className="mt-4 max-w-xs text-sm text-white/50">
          Letters are being written — this room will open properly soon.
        </p>
      </div>
    </SceneLayout>
  );
}
