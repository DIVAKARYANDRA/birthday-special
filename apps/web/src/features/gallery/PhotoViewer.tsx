/**
 * PhotoViewer — Part 7: "Photo viewer." Full-screen focused view with
 * swipe-between-photos navigation, per docs/02-design-system.md,
 * Section 9: "ambient background dims and blurs behind the focused
 * photo to create intimate focus... swipe/drag to move between photos."
 *
 * Swipe implemented via Framer Motion's `onDragEnd` velocity/offset
 * check (a standard touch-carousel technique) rather than a scroll-snap
 * container, giving more precise control over the swipe threshold and
 * the ability to animate the transition.
 */
import { AnimatePresence, motion } from "framer-motion";

import { EASE_OUT } from "@/animations/motionPrimitives";
import type { GalleryPhoto } from "./types";

interface PhotoViewerProps {
  photos: GalleryPhoto[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const SWIPE_THRESHOLD = 60;

export default function PhotoViewer({ photos, activeIndex, onClose, onNavigate }: PhotoViewerProps) {
  const photo = photos[activeIndex];
  if (!photo) return null;

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x > SWIPE_THRESHOLD && activeIndex > 0) {
      onNavigate(activeIndex - 1);
    } else if (info.offset.x < -SWIPE_THRESHOLD && activeIndex < photos.length - 1) {
      onNavigate(activeIndex + 1);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          key={photo.id}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="flex h-64 w-64 flex-col items-center justify-center rounded-lg text-6xl shadow-2xl"
          style={{ background: photo.placeholderColor }}
        >
          <span aria-hidden="true">{photo.placeholderEmoji}</span>
        </motion.div>

        <p className="mt-6 max-w-xs px-6 text-center text-sm text-white/80">{photo.caption}</p>

        <div className="mt-4 flex gap-1.5">
          {photos.map((p, i) => (
            <span
              key={p.id}
              className={`h-1.5 w-1.5 rounded-full ${i === activeIndex ? "bg-white" : "bg-white/30"}`}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          aria-label="Close photo viewer"
          className="absolute right-4 top-4 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-lg text-white active:scale-90"
          style={{ top: "calc(1rem + env(safe-area-inset-top))" }}
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
