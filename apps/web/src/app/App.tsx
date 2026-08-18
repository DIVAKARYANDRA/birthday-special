/**
 * Root application component — route tree.
 *
 * Per docs/05-frontend-architecture.md, Section 9: scene routes are
 * progression-gated conceptually, but since progressionStore is
 * explicitly local/mock (no real backend Progress API yet — see that
 * store's own scope note), actual server-enforced gating doesn't exist
 * at this layer yet either; WorldMapScene simply declines to navigate
 * into a locked node client-side. Direct-URL access to a "locked" scene
 * therefore isn't blocked at the route level in this foundation — that
 * enforcement point is explicitly future work once a real Public
 * Experience API exists to check against, per
 * docs/05-frontend-architecture.md, Section 17's "client-side gating is
 * UX-only, never security" principle (doubly true here, since there is
 * no server-side check to fall back on yet at all).
 *
 * SceneTransition wraps the route Outlet-equivalent so every navigation
 * cross-fades (Part 2: "no hard page reloads").
 *
 * CODE SPLITTING (Part 11 — Performance): every scene is a
 * `React.lazy` dynamic import, per docs/01-system-architecture.md,
 * Section 14 and docs/05-frontend-architecture.md, Section 16 — the
 * initial bundle contains only LandingScene (the entry experience) plus
 * shared shell code; every other scene's code loads only when its route
 * is actually visited. `LandingScene` itself stays a static import since
 * it's needed for the very first paint regardless.
 */
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import SceneTransition from "@/components/global/SceneTransition";
import LandingScene from "@/scenes/landing/LandingScene";
import BackgroundMusicPlayer from "@/features/audio/BackgroundMusicPlayer";
import LetterDetailScene from "@/scenes/letters/LetterDetailScene";
import CupidArrowScene from "@/scenes/games/CupidArrowScene";

const IntroSequence = lazy(() => import("@/scenes/landing/IntroSequence"));
const WorldMapScene = lazy(() => import("@/scenes/world-map/WorldMapScene"));
const MemoriesScene = lazy(() => import("@/scenes/memories/MemoriesScene"));
const TimelineScene = lazy(() => import("@/scenes/timeline/TimelineScene"));
const GalleryScene = lazy(() => import("@/scenes/gallery/GalleryScene"));
const LettersScene = lazy(() => import("@/scenes/letters/LettersScene"));
const MemoryMatchScene = lazy(
  () => import("@/scenes/games/MemoryMatchScene")
);
const GameHubScene = lazy(
()=>import("@/scenes/games/GameHubScene")
);
const StoryPuzzleScene = lazy(
()=>import("@/scenes/games/StoryPuzzleScene")
);
const HiddenObjectsScene = lazy(
()=>import("@/scenes/games/HiddenObjectsScene")
);
import HeartRushScene
from "@/scenes/games/HeartRushScene";
/** Ambient, in-world loading fallback — per
 * docs/02-design-system.md, Section 7: "loading indicators are
 * ambient/thematic... rather than generic spinners." A minimal shimmer
 * rather than a spinner, consistent with the night-sky palette so a
 * lazy-chunk fetch never looks like a jarring app-level loading state. */
function SceneFallback() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#14101f]">
      <span aria-hidden="true" className="animate-pulse text-2xl">
        ✨
      </span>
    </div>
  );
}

function AnimatedRoutes() {
  return (
    <SceneTransition>
      <Suspense fallback={<SceneFallback />}>
        <Routes>
          <Route path="/" element={<LandingScene />} />
          <Route path="/intro" element={<IntroSequence />} />
          <Route path="/world" element={<WorldMapScene />} />
          <Route path="/memories" element={<MemoriesScene />} />
          <Route path="/timeline" element={<TimelineScene />} />
          <Route path="/gallery" element={<GalleryScene />} />
          <Route path="/letters" element={<LettersScene />} />
          <Route
            path="/letters/:id"
            element={<LetterDetailScene />}
            />
          <Route 
            path="/games/memory-match" 
            element={<MemoryMatchScene />} 
            />
            <Route
              path="/games/hidden-objects"
              element={<HiddenObjectsScene />}
              />
            <Route
              path="/games"
              element={<GameHubScene />}
              />
            <Route
              path="/games/story-puzzle"
              element={<StoryPuzzleScene />}
              />
            <Route
            path="/games/cupid-arrow"
            element={<CupidArrowScene />}
            />
            <Route
            path="/games/heart-rush"
            element={
              <HeartRushScene />
            }
          />

           
          <Route path="*" element={<LandingScene />} />
        </Routes>
      </Suspense>
    </SceneTransition>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <BackgroundMusicPlayer />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
