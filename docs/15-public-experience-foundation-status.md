# Prompt 15 — Public Experience Foundation Status

This document records what Prompt 15 established — the mobile-first magical user experience foundation for `apps/web` — building on `docs/14-admin-platform-status.md`, so Prompt 16 has a precise, checkable record of what's real versus what's still deferred.

---

## 1. Files Created / Modified

**Created — infrastructure:**
- `src/hooks/{useReducedMotion,useBreakpoint,useDeviceCapability}.ts`
- `src/stores/{uiStore,progressionStore}.ts`
- `src/animations/motionPrimitives.ts`
- `src/components/global/{ParticlesLayer,AmbientBackground,SceneLayout,BottomNav,SceneTransition}.tsx`
- `src/components/ui/{Breadcrumb,MagicButton}.tsx`

**Created — scenes and features:**
- `src/scenes/landing/{LandingScene,IntroSequence}.tsx`
- `src/scenes/world-map/{WorldMapScene,WorldMapNode,ComingSoonScene}.tsx`
- `src/scenes/memories/MemoriesScene.tsx` + `src/features/memories/{types,data,MemoryCard,README}`
- `src/scenes/timeline/TimelineScene.tsx` + `src/features/timeline/{types,data}`
- `src/scenes/gallery/GalleryScene.tsx` + `src/features/gallery/{types,data,FloatingPolaroid,PhotoViewer}`
- `src/scenes/letters/LettersScene.tsx` (minimal — see Section 7)

**Modified:**
- `src/app/App.tsx` — real route tree, lazy-loaded scenes, `Suspense`.
- `src/app/main.tsx` — comment updated explaining why React Query is deliberately not mounted yet.
- `index.html` — added `viewport-fit=cover` for safe-area support.
- `apps/web/README.md`, `docs/README.md` — updated.

**Untouched (confirmed — see Section 6):**
- `apps/admin` — entirely (65 files, unchanged from Prompt 14).
- `services/api` — entirely (zero `.py` files modified).
- `src/scenes/{castle,final-surprise,game-hub,secret-room}/`, `src/features/{games,final-surprise,secret-room,voice-notes,love-meter}/` — all still exactly their original READMEs, per this prompt's explicit exclusions.
- `tailwind.config.js`, `src/theme/index.css` — the existing token/CSS-variable foundation from Prompt 7 was sufficient; no changes needed.

---

## 2. Mobile-First Decisions

Per Prompt 15's "most important requirement," every layout decision started from a 375px portrait viewport, with larger breakpoints treated as *progressive enhancement*, never the baseline:

- **Grids re-stage, not just resize:** `WorldMapScene`'s node grid is 2 columns at the mobile baseline (comfortable tap targets), opening to 3 at `sm:` — more content becomes visible on a larger screen, rather than the same 2-column layout simply stretching wider. `MemoriesScene`'s card list is single-column on mobile, 2 columns from `sm:`.
- **Touch-first, hover as enhancement only:** every interactive element (`MagicButton`, `WorldMapNode`, `MemoryCard`, `FloatingPolaroid`) uses `active:scale-*` for immediate tap feedback; the one `hover:` usage in the entire implementation (`MemoryCard`'s lift) is explicitly scoped `sm:hover:` so it never becomes a mobile-required affordance.
- **Native drag/swipe over custom touch-event wiring:** `FloatingPolaroid`'s drag and `PhotoViewer`'s swipe-between-photos both use Framer Motion's `drag`/`onDragEnd`, which handles touch pointer events natively — no separate `touchstart`/`touchmove` listeners needed, and no risk of fighting native scroll.
- **Bottom navigation, not a desktop-style top bar:** `BottomNav` is fixed to the viewport bottom (thumb-reachable) for every breakpoint — per this app's "desktop is secondary" instruction, no separate desktop navigation pattern was built; the same bottom bar simply stays comfortably usable at larger widths.
- **Safe-area awareness throughout:** `index.html` gained `viewport-fit=cover`; `BottomNav`, `Breadcrumb`, `LandingScene`'s mute button, and `SceneLayout`'s bottom padding all use `env(safe-area-inset-*)` so content never sits under a device's notch or home-indicator.
- **44px+ touch targets everywhere:** every button/link/nav item enforces a `min-h-[44px]` (many `48px`), per standard mobile accessibility touch-target guidance — checked explicitly component by component, not assumed.
- **Scroll-as-navigation, not scroll-jacking:** `TimelineScene`'s "train journey" uses native scroll with `whileInView` progress reveals — the single most natural one-handed gesture on a phone — rather than intercepting scroll for a custom horizontal-train animation that would fight native touch scrolling.

---

## 3. User Experience Architecture

**Layering**, per `docs/01-system-architecture.md`, Section 4 and `docs/05-frontend-architecture.md`, Section 5/10:

```
AmbientBackground (gradient sky + moon + ParticlesLayer, canvas-isolated from React render tree)
   └── SceneLayout (adds BottomNav + safe-area-aware content padding)
         └── SceneTransition (AnimatePresence cross-fade on route change)
               └── [lazy-loaded scene] (Landing / Intro / WorldMap / Memories / Timeline / Gallery / Letters)
                     └── feature components (MemoryCard / FloatingPolaroid / WorldMapNode / ...)
```

**Animation system** (Part 9): Framer Motion is the primary tool throughout (declarative, component-scoped — matches every animation in this prompt's scope, per `docs/05-frontend-architecture.md`, Section 10's tool-selection guidance). GSAP was deliberately **not** reached for — `IntroSequence`'s book-opening sequence, the one candidate complex-enough to consider it, was implemented with Framer Motion's staged variants instead, since it's a single one-shot sequence, not a scenario requiring GSAP's timeline-scrubbing capability. Lottie is listed as a dependency (Prompt 7) but has no actual `.json` asset to render yet — noted as a remaining exclusion, not implemented. Every animated component threads `useReducedMotion()` through (`withReducedMotion` helper, `AmbientBackground`, `MagicButton`, `SceneTransition`, `WorldMapNode`, `FloatingPolaroid`), per `docs/02-design-system.md`, Section 14.

**Theme Engine** (Part 8): implemented at foundation scope — `AmbientBackground`'s `mode` prop (`night`/`twilight`/`dawn`) is the concrete day/night switch, with each scene selecting the mode matching its position on the emotional arc (Landing/WorldMap/Gallery = night; Memories = dawn; Timeline/Letters = twilight), directly reflecting `docs/02-design-system.md`, Section 6's mood-curve principle. The **full** Theme Engine (admin-authored Theme data resolved to CSS variables at runtime, per `docs/05-frontend-architecture.md`, Section 5) remains future work — there's no Public Experience API yet to deliver that data, so `mode` is presently a per-scene hardcoded prop rather than server-driven. This is the exact seam a future Theme Engine implementation would plug into.

**World Map & progression**: `progressionStore` is explicitly local-only (see its own extensive module docstring) — no real `VisitorSession`/`UnlockedItem` integration exists yet (Prompt 13's backend has no visitor-callable API). Locked nodes render per `docs/05-frontend-architecture.md`, Section 2's "visibly teased even if locked" principle (grayscale emoji + lock glyph, not hidden).

---

## 4. Performance Strategy

- **Code splitting** (Part 11): every scene except `LandingScene` (needed for first paint) is a `React.lazy` dynamic import in `App.tsx`, wrapped in `Suspense` with an ambient (not spinner) fallback.
- **Canvas-isolated ambient animation**: `ParticlesLayer` runs its entire animation loop inside a `requestAnimationFrame` callback closed over plain arrays — zero React re-renders per frame, per `docs/01-system-architecture.md`, Section 9's explicit performance requirement.
- **Adaptive particle density**: `useDeviceCapability` combines `navigator.hardwareConcurrency`, `navigator.deviceMemory` (where exposed), and reduced-motion preference into a `high`/`medium`/`low` tier; `ParticlesLayer` scales its particle count accordingly (`PARTICLE_DENSITY` multiplier: 1 / 0.55 / 0.25).
- **Reduced-motion respected everywhere**: forces the lowest performance tier AND swaps every Framer Motion variant to its flattened opacity-only form (`withReducedMotion`), satisfying both the performance and accessibility angles of the same signal.
- **No unoptimized media**: every "photo" in this prompt is a solid-color CSS background + emoji, by design (see Section 7) — there is no unoptimized image loading to worry about yet; real image optimization (Cloudinary-delivered responsive URLs, per `docs/04-backend-architecture.md`, Section 7) is inherently deferred until MediaAsset delivery exists for visitors.

---

## 5. Validation Performed

1. **Frontend syntax check:** all 33 new/modified TypeScript/TSX files in `apps/web` checked with `tsc --noEmit --ignoreConfig` (explicit compiler flags, since no `node_modules` exists in this sandbox). **Zero genuine errors** — the only remaining diagnostic (`WorldMapScene.tsx`'s `key` prop) is the same confirmed `@types/react`-resolution artifact already identified and documented during Prompt 14's validation (React's JSX namespace special-cases `key`, which requires real type declarations to recognize — resolves cleanly once `node_modules` exists).
2. **Confirmed `apps/admin` untouched:** 65 files, byte-for-byte unchanged from Prompt 14.
3. **Confirmed `services/api` untouched:** zero `.py` files modified since the Prompt 14 status document was written.
4. **Confirmed excluded scenes/features untouched:** `scenes/{castle,final-surprise,game-hub,secret-room}/` and `features/{games,final-surprise,secret-room,voice-notes,love-meter}/` all still contain exactly their original Prompt 7 `README.md` — nothing added.
5. **Empty directory check:** zero, across the entire repository.
6. **Mobile-first spot-check:** every new interactive component confirmed to have a `min-h-[44px]` (or larger) touch target; confirmed the sole `hover:` usage in the codebase is `sm:`-scoped.
7. **Safe-area spot-check:** confirmed `env(safe-area-inset-*)` used in `BottomNav`, `Breadcrumb`, `LandingScene`'s mute button, and `SceneLayout`'s bottom padding; confirmed `index.html`'s `viewport-fit=cover` is present (the prerequisite for those values to resolve non-zero on real devices).

**Sandbox limitation, stated plainly (same as every prior prompt):** no network access, no `node_modules` installed for `apps/web`. The `tsc --noEmit --ignoreConfig` checks performed here catch genuine syntax and logic errors (as they did in Prompt 14) but cannot fully type-check against real `framer-motion`/`react-router-dom` type declarations, and — critically — **nothing in this implementation has actually been rendered in a browser**. Visual/animation correctness (does the particle field actually look magical, does the book-opening animation read as intended, do touch gestures feel right on a real device) is unverified and should be the first thing checked in a package-accessible environment: `npm install && npm run dev`, then manual testing on an actual phone (or at minimum browser dev-tools device emulation) at the 375px baseline specifically.

---

## 6. Animation Strategy (summary)

| Concern | Tool | Why |
|---|---|---|
| Component entrance/exit, list stagger | Framer Motion variants (`motionPrimitives.ts`) | Declarative, component-scoped, matches every animation need in this prompt |
| Route/scene transitions | Framer Motion `AnimatePresence` (`SceneTransition`) | Single coordinated cross-fade, no page reload |
| Book-opening intro | Framer Motion staged variants | One-shot sequence — did not meet the bar for GSAP's added complexity |
| Ambient stars/fireflies/dust | Raw Canvas + `requestAnimationFrame` | Isolated from React's render tree entirely — the one case where neither Framer Motion nor GSAP was appropriate |
| GSAP | *Not used this prompt* | No scene in this prompt's scope needed timeline-scrubbing precision; reserved for a future Castle/Final Surprise "wow moment," per `docs/05-frontend-architecture.md`, Section 10 |
| Lottie | *Not used this prompt* | Dependency present (Prompt 7), no `.json` asset exists yet to render |

---

## 7. Remaining Exclusions (confirmed, per Prompt 15's explicit scope)

- Games, Birthday Castle content, Final celebration, video player, fireworks — none implemented; their scene/feature folders remain untouched placeholders.
- Admin improvements, game logic, unlock logic — none touched; `LettersScene` is deliberately minimal (non-interactive envelope silhouettes) precisely because real letter-opening depends on Unlock Engine integration, explicitly excluded.
- **Real backend data of any kind** — every scene's content is static placeholder data (`src/features/*/data.ts`), clearly documented in each file as temporary pending a future Public Experience API; this is the single largest gap between "foundation" and "finished," and is the natural next step.
- GSAP and Lottie usage — dependencies present, not yet exercised (see Section 6).
- The full admin-Theme-data-driven Theme Engine — only the `mode` prop seam exists (see Section 3).
- Live browser/device verification — see Section 5's sandbox-limitation note.

---

## 8. Confirmation

**Prompt 15 is fully completed.** All eleven parts are addressed at foundation scope: Landing (night sky, stars, moon, fireflies, particles, Begin button, mute toggle, staged reveal), Cinematic Intro (book-opening, "Our Story," client-side transition), World Map (7 locations, locked/unlocked states, touch nav), Navigation (bottom nav, breadcrumb, back navigation, scene transitions), Memory Experience (cards, previews, Timeline relationship link), Timeline Experience (train journey, stations, chapter navigation, progress-on-scroll), Photo Gallery (floating polaroids, flip, drag, viewer with swipe), Theme Engine (day/night mode seam), Animation System (Framer Motion primitives, reduced-motion handling throughout), Responsive System (mobile-first at every layer, safe-area support, 44px+ touch targets), and Performance (code splitting, canvas-isolated particles, adaptive density).

Mobile-first is genuinely the implementation baseline, not a retrofit — confirmed via the spot-checks in Section 5. Desktop remains fully supported via progressive `sm:`/`md:` enhancement. The existing backend and admin frontend are confirmed completely unmodified. No excluded content (games, castle, final celebration, video, fireworks) was touched.

---

## 9. Recommendation for Prompt 16

The most valuable next step is almost certainly **implementing the Public Experience API** (the visitor-facing read path `docs/04-backend-architecture.md`, Section 3 has described since Prompt 4 but never built) — every `data.ts` placeholder file in this prompt was deliberately shaped to make that integration a drop-in replacement rather than a redesign, and `progressionStore`'s local-only state is the other half of that same gap (a real `VisitorSession` + `UnlockedItem` read path). This would let Prompt 15's visual foundation finally render real content and real progression instead of demo data, and is a natural, well-scoped unit of work distinct from adding new visual features. Alternatively, if visual richness is preferred first, **Games** (still entirely unimplemented) would complete both the frontend's Game Zone destination and the backend Unlock Engine's last unsupported condition type in one prompt.

This recommendation is offered for context; the actual content of Prompt 16 is up to you.

---

Waiting for confirmation before proceeding to Prompt 16.
