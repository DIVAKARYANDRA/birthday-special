/**
 * MemoriesScene — "Memory Garden," Part 5. Card grid + a tap-to-expand
 * detail view. "Relationship with Timeline" (Part 5's explicit
 * requirement): each detail view links to `/timeline`, reflecting
 * docs/03-data-architecture.md, Section 4's real relationship (the same
 * Memory entity is what Timeline, Prompt 12, sequences into chapters) —
 * this link is illustrative or a real navigation, not a deep-link to a
 * specific chapter (that would require the same not-yet-implemented
 * Public Experience API/real data, per this scene's data.ts).
 *
 * MOBILE-FIRST: single-column card list at the 375px baseline
 * (comfortable full-width tap targets), 2 columns from `sm:` up.
 */
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

import SceneLayout from "@/components/global/SceneLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import MemoryCard from "@/features/memories/MemoryCard";
import { useEffect, useState } from "react";
import {
  getMemories,
  type MemoryRead,
} from "@/api/memoriesApi";
import { fadeInUp, staggerContainer } from "@/animations/motionPrimitives";

export default function MemoriesScene() {
  const [memories,setMemories] =
  useState<MemoryRead[]>([]);

const [selectedId,setSelectedId] =
  useState<string | null>(null);


const selectedMemory =
  memories.find(
    (memory)=>memory.id===selectedId
  ) ?? null;


useEffect(()=>{

 async function load(){

   const data = await getMemories();

   setMemories(data);

 }

 void load();

},[]);

  return (
    <SceneLayout mode="dawn">
      <Breadcrumb label="Memory Garden" />
      <div className="flex-1 px-5 pb-6 pt-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} onSelect={setSelectedId} />
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-t-3xl border border-white/10 bg-[#1d1533] p-6 sm:rounded-3xl"
              style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
            >
              <span aria-hidden="true" className="mb-3 block text-4xl">
                {selectedMemory.images?.[0]?.url ? (
                  <img
                    src={selectedMemory.images[0].url}
                    alt={selectedMemory.title}
                    className="mb-3 h-32 w-full rounded-xl object-cover"
                  />
                ) : (
                  <span aria-hidden="true" className="mb-3 block text-4xl">
                    🌸
                  </span>
                )}
              </span>
              <h2 className="mb-1 font-display text-xl text-white">{selectedMemory.title}</h2>
              <p className="mb-4 text-sm text-white/70">{selectedMemory.description}</p>
              <div className="flex gap-3">
                <Link
                  to="/timeline"
                  className="min-h-[44px] flex-1 rounded-full bg-white/10 px-4 py-2 text-center text-sm text-white active:scale-95"
                >
                  View in Timeline
                </Link>
                <button
                  onClick={() => setSelectedId(null)}
                  className="min-h-[44px] flex-1 rounded-full bg-primary px-4 py-2 text-center text-sm text-white active:scale-95"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneLayout>
  );
}
