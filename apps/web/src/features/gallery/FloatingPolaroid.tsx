/**
 * FloatingPolaroid — Part 7: "Floating Polaroids... Flip animations...
 * Drag interactions." Per docs/02-design-system.md, Section 9: "slight
 * random rotation per photo, warm off-white border, soft drop shadow,
 * subtle idle float/sway."
 *
 * DRAG (touch-first): Framer Motion's `drag` prop works natively with
 * touch pointer events — no separate touch-event wiring needed. Dragged
 * just far enough resets via `dragElastic`/`dragConstraints={false}`
 * with a snap-back spring, giving a tactile "pick it up and it springs
 * back" feel rather than actually reordering anything (no persistence
 * exists for photo order in this placeholder-data foundation).
 *
 * FLIP: tap toggles a 3D Y-axis rotation revealing the caption on the
 * back — `preserve-3d`/`backfaceVisibility` per standard Framer Motion
 * flip-card technique.
 */
import { useState } from "react";
import { motion } from "framer-motion";

import { floatLoop } from "@/animations/motionPrimitives";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { GalleryPhoto } from "./types";

interface FloatingPolaroidProps {
  photo: GalleryPhoto;
  onOpen: (id: string) => void;
}

export default function FloatingPolaroid({ photo, onOpen }: FloatingPolaroidProps) {
  const [flipped, setFlipped] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="relative h-40 w-32 shrink-0 cursor-grab active:cursor-grabbing"
      style={{ rotate: photo.rotationDeg }}
      drag
      dragElastic={0.6}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      whileTap={{ scale: 1.05 }}
      variants={!reducedMotion ? floatLoop : undefined}
      animate={!reducedMotion ? "animate" : undefined}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => setFlipped((f) => !f)}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col rounded-sm border-4 border-b-8 border-white bg-white p-1 shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div
            className="flex flex-1 items-center justify-center text-3xl"
            style={{ background: photo.placeholderColor }}
          >
            <span aria-hidden="true">{photo.placeholderEmoji}</span>
          </div>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-sm border-4 border-white bg-[#3a2456] p-3 text-center shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-xs text-white">{photo.caption}</p>
        </div>
      </motion.div>

      <button
        onClick={() => onOpen(photo.id)}
        aria-label={`View full photo: ${photo.caption}`}
        className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-white active:scale-90"
      >
        🔍
      </button>
    </motion.div>
  );
}
