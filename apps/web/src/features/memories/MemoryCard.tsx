/**
 * MemoryCard — Part 5: Memory Garden card.
 *
 * Displays real photos uploaded from Admin Media/Memory management.
 * Falls back gracefully when no image is attached.
 */

import { motion } from "framer-motion";

import { fadeInUp } from "@/animations/motionPrimitives";
import type { MemoryRead } from "@/api/memoriesApi";

const IMPORTANCE_LABEL: Record<string, string> = {
  core_milestone: "Milestone",
  notable: "Notable",
  small_moment: "Small Moment",
};

interface MemoryCardProps {
  memory: MemoryRead;
  onSelect: (id: string) => void;
}

export default function MemoryCard({
  memory,
  onSelect,
}: MemoryCardProps) {

  const dateLabel = memory.memory_date
    ? new Date(memory.memory_date).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      )
    : memory.approximate_date_label;


  const previewImage =
    memory.images &&
    memory.images.length > 0
      ? memory.images[0].url
      : null;


  return (
    <motion.button
      variants={fadeInUp}
      onClick={() => onSelect(memory.id)}
      className="
        flex w-full flex-col overflow-hidden
        rounded-2xl border border-white/10
        bg-white/[0.06]
        text-left
        backdrop-blur-sm
        active:scale-[0.98]
        sm:transition-transform
        sm:hover:-translate-y-1
      "
    >

      {/* Photo Preview */}
      <div
        className="
          flex h-48
          items-center
          justify-center
          overflow-hidden
          bg-gradient-to-br
          from-white/10
          to-transparent
        "
      >

        {previewImage ? (
          <img
            src={previewImage}
            alt={memory.title}
            className="
              h-full
              w-full
              object-cover
            "
          />
        ) : (
          <span
            aria-hidden="true"
            className="text-4xl"
          >
            🌸
          </span>
        )}

      </div>


      {/* Content */}
      <div
        className="
          flex flex-col
          gap-1
          px-4
          py-3
        "
      >

        {memory.is_featured && (
          <span
            className="
              mb-1
              w-fit
              rounded-full
              bg-accent/20
              px-2
              py-0.5
              text-[10px]
              font-medium
              uppercase
              tracking-wide
              text-accent
            "
          >
            Featured
          </span>
        )}


        <h3
          className="
            font-display
            text-base
            text-white
          "
        >
          {memory.title}
        </h3>


        {dateLabel && (
          <p
            className="
              text-xs
              text-white/50
            "
          >
            {dateLabel}
          </p>
        )}


        {memory.description && (
          <p
            className="
              mt-1
              line-clamp-2
              text-sm
              text-white/70
            "
          >
            {memory.description}
          </p>
        )}


        <span
          className="
            mt-2
            text-[11px]
            uppercase
            tracking-wide
            text-white/40
          "
        >
          {
            IMPORTANCE_LABEL[memory.importance]
              ?? memory.importance
          }
        </span>

      </div>

    </motion.button>
  );
}