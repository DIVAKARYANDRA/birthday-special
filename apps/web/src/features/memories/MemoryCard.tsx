/**
 * MemoryCard — Part 5: "Beautiful cards... Photo previews... Story
 * previews." Per docs/02-design-system.md, Section 4: glass-panel card,
 * soft rounded corners, gentle hover-lift ON DESKTOP ONLY (this app is
 * touch-first — the lift/tilt affordance is a `sm:hover:` progressive
 * enhancement, never required to perceive the card as interactive on
 * mobile, where `active:scale-*` carries the tap feedback instead).
 *
 * `previewEmoji` stands in for a real photo preview (no MediaAsset
 * delivery pipeline exists yet for visitor-facing content — see
 * data.ts's scope note) — the layout reserves the exact space a real
 * `<img>` would occupy, so swapping it in later is a drop-in change.
 */
import { motion } from "framer-motion";

import { fadeInUp } from "@/animations/motionPrimitives";
import type { MemorySummary } from "./types";

const IMPORTANCE_LABEL: Record<string, string> = {
  core_milestone: "Milestone",
  notable: "Notable",
  small_moment: "Small Moment",
};

interface MemoryCardProps {
  memory: MemorySummary;
  onSelect: (id: string) => void;
}

export default function MemoryCard({ memory, onSelect }: MemoryCardProps) {
  const dateLabel = memory.memory_date
    ? new Date(memory.memory_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : memory.approximate_date_label;

  return (
    <motion.button
      variants={fadeInUp}
      onClick={() => onSelect(memory.id)}
      className="flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] text-left backdrop-blur-sm active:scale-[0.98] sm:transition-transform sm:hover:-translate-y-1"
    >
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-white/10 to-transparent text-4xl">
        <span aria-hidden="true">{memory.previewEmoji}</span>
      </div>
      <div className="flex flex-col gap-1 px-4 py-3">
        {memory.is_featured && (
          <span className="mb-1 w-fit rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
            Featured
          </span>
        )}
        <h3 className="font-display text-base text-white">{memory.title}</h3>
        {dateLabel && <p className="text-xs text-white/50">{dateLabel}</p>}
        {memory.description && <p className="mt-1 line-clamp-2 text-sm text-white/70">{memory.description}</p>}
        <span className="mt-2 text-[11px] uppercase tracking-wide text-white/40">
          {IMPORTANCE_LABEL[memory.importance] ?? memory.importance}
        </span>
      </div>
    </motion.button>
  );
}
