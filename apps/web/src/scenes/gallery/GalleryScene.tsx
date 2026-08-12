/**
 * GalleryScene — Part 7. Composes FloatingPolaroid (stack/drag/flip) and
 * PhotoViewer (full-screen swipe view). "Stack animations": polaroids
 * are laid out in a loosely offset flex-wrap arrangement (per
 * docs/02-design-system.md, Section 9's "scattered, not a grid... like an
 * open memory box"), each with independent idle float + random
 * rotation, rather than a uniform photo grid.
 */
import { useState } from "react";
import { motion } from "framer-motion";

import SceneLayout from "@/components/global/SceneLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import FloatingPolaroid from "@/features/gallery/FloatingPolaroid";
import PhotoViewer from "@/features/gallery/PhotoViewer";
import { DEMO_PHOTOS } from "@/features/gallery/data";
import { staggerContainer } from "@/animations/motionPrimitives";

export default function GalleryScene() {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  return (
    <SceneLayout mode="night" showFireflies>
      <Breadcrumb label="Gallery" />
      <div className="flex-1 px-5 pb-8 pt-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-x-2 gap-y-8"
        >
          {DEMO_PHOTOS.map((photo, index) => (
            <FloatingPolaroid key={photo.id} photo={photo} onOpen={() => setViewerIndex(index)} />
          ))}
        </motion.div>
      </div>

      {viewerIndex !== null && (
        <PhotoViewer
          photos={DEMO_PHOTOS}
          activeIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
        />
      )}
    </SceneLayout>
  );
}
