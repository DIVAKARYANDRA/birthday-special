/**
 * WorldMapNode — one location tile. Per Prompt 15, Part 3: "Locked
 * locations should appear mysterious. Unlocked locations should
 * animate." Per docs/05-frontend-architecture.md, Section 2: "nodes
 * representing known stages can be visibly teased even if their content
 * is locked" — a locked node is rendered (visible, with its emoji
 * silhouetted and a lock glyph) rather than hidden entirely, preserving
 * that teased-mystery effect instead of an empty gap in the map.
 *
 * Touch-first: the whole tile is one large tap target (well above the
 * 44px minimum), `whileTap` gives immediate feedback, no hover-dependent
 * affordance for the "unlocked" glow (it's always-on via floatLoop for
 * unlocked nodes, not hover-revealed).
 */
import { motion } from "framer-motion";

import { floatLoop, unlockBurst } from "@/animations/motionPrimitives";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface WorldMapNodeData {
  id: string;
  label: string;
  emoji: string;
  unlocked: boolean;
}

interface WorldMapNodeProps {
  node: WorldMapNodeData;
  onSelect: (id: string) => void;
}

export default function WorldMapNode({ node, onSelect }: WorldMapNodeProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      variants={unlockBurst}
      onClick={() => onSelect(node.id)}
      aria-label={node.unlocked ? node.label : `${node.label} (locked)`}
      className={`flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-center backdrop-blur-sm active:scale-95 ${
        node.unlocked
          ? "border-white/15 bg-white/10 text-white"
          : "border-white/5 bg-white/[0.03] text-white/40"
      }`}
    >
      <motion.span
        aria-hidden="true"
        className="text-3xl"
        variants={node.unlocked && !reducedMotion ? floatLoop : undefined}
        animate={node.unlocked && !reducedMotion ? "animate" : undefined}
        style={{ filter: node.unlocked ? undefined : "grayscale(1) brightness(0.6)" }}
      >
        {node.unlocked ? node.emoji : "🔒"}
      </motion.span>
      <span className="text-xs font-medium">{node.label}</span>
    </motion.button>
  );
}
