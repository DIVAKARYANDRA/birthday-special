/**
 * WorldMapScene — Part 3. The central navigation hub, per
 * docs/01-system-architecture.md, Section 2: renders every location as a
 * WorldMapNode based on progressionStore's (currently local/mock — see
 * that store's own scope note) unlocked state.
 *
 * All 7 locations from Prompt 15, Part 3 are represented. Per this
 * prompt's exclusions (Games/Castle/final celebration not implemented),
 * tapping "Game Zone" or "Birthday Castle" navigates to a lightweight
 * "coming soon" placeholder rather than a 404 or a dead tap — the node
 * itself is real, its destination content is future work.
 *
 * MOBILE-FIRST grid: 2 columns at the 375px baseline (comfortable tap
 * targets without crowding), opening to 3 columns at `sm:` and beyond —
 * this is content RE-STAGED per breakpoint (more nodes visible on a
 * larger screen), not the same layout merely stretched, per
 * docs/02-design-system.md, Section 13's mobile-is-not-shrunk-desktop
 * principle.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import SceneLayout from "@/components/global/SceneLayout";
import WorldMapNode, { type WorldMapNodeData } from "./WorldMapNode";
import { staggerContainer } from "@/animations/motionPrimitives";
import { useProgressionStore, type WorldMapLocationId } from "@/stores/progressionStore";

const LOCATIONS: { id: WorldMapLocationId; label: string; emoji: string; to: string }[] = [
  { id: "memory-garden", label: "Memory Garden", emoji: "🌸", to: "/memories" },
  { id: "timeline-train", label: "Timeline Train", emoji: "🚂", to: "/timeline" },
  { id: "love-letters", label: "Love Letters", emoji: "💌", to: "/letters" },
  { id: "gallery", label: "Gallery", emoji: "📷", to: "/gallery" },
  {
    id:"game-zone",
    label:"Game Zone",
    emoji:"🎮",
    to:"/games"
  }
  { id: "birthday-castle", label: "Birthday Castle", emoji: "🏰", to: "/coming-soon" },
  { id: "secret-room", label: "Secret Room", emoji: "🗝️", to: "/coming-soon" },
];

export default function WorldMapScene() {
  const navigate = useNavigate();
  const isLocationUnlocked = useProgressionStore((s) => s.isLocationUnlocked);

  const nodes: (WorldMapNodeData & { to: string })[] = LOCATIONS.map((loc) => ({
    id: loc.id,
    label: loc.label,
    emoji: loc.emoji,
    unlocked: isLocationUnlocked(loc.id),
    to: loc.to,
  }));

  function handleSelect(id: string) {
    const location = nodes.find((n) => n.id === id);
    if (!location || !location.unlocked) return;
    navigate(location.to);
  }

  return (
    <SceneLayout mode="night" showFireflies>
      <div className="flex flex-1 flex-col px-5" style={{ paddingTop: "calc(2rem + env(safe-area-inset-top))" }}>
        <p className="mb-1 text-center text-xs uppercase tracking-[0.3em] text-white/40">Explore</p>
        <h1 className="mb-6 text-center font-display text-2xl text-white">Choose Your Path</h1>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          {nodes.map((node) => (
            <WorldMapNode key={node.id} node={node} onSelect={handleSelect} />
          ))}
        </motion.div>
      </div>
    </SceneLayout>
  );
}
