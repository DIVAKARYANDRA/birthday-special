# "The Journey To My Heart" — Frontend Architecture Blueprint
### Prompt 5 Deliverable — Architecture Only, No Code / No JSX / No CSS / No Implementation

This document defines the complete frontend architecture for both applications, built on the system architecture (Prompt 1), design system (Prompt 2), data architecture (Prompt 3), and backend/API blueprint (Prompt 4). It is the binding frontend reference for every future implementation prompt.

---

## Section 1 — Frontend Architecture Style

**Application structure:** both applications follow the **vertical-slice, feature-based organization** established in Prompt 1 (Section 3) — a scene/module owns its components, hooks, and local state together, rather than the codebase being organized by technical type first. This is reaffirmed here because it directly shapes how each subsequent section is structured.

**Feature-based organization:** a "feature" is a self-contained slice of the experience (Timeline, Gallery, Letters, a specific Game, an Admin content module) — it owns everything specific to itself and exposes only what other parts of the app need (e.g., Gallery might expose a "featured memory" reference for the World Map to display, without the World Map knowing Gallery's internals).

**Shared systems:** cross-cutting concerns that no single feature owns — the Theme Engine, Animation orchestration layer, Audio Engine, Progression/Unlock client state, and the API client layer (Prompt 1, Section 3/9) — live outside any feature folder, consumed *by* features, never owned by one.

**Reusable layers (responsibility boundaries):**

| Layer | Belongs Here | Never Here |
|---|---|---|
| **Pages/Scenes** | Composition only — arranging features/components for a given route, scene-level layout, entry/exit orchestration | Business logic, direct API calls, styling decisions beyond layout |
| **Features** | Domain-specific components, hooks, local state slices, feature-specific API hooks | Concerns belonging to a different feature; global app configuration |
| **Components** | Presentation-only, reusable UI primitives and composed visual elements (buttons, cards, panels — per Prompt 2's component language) | Data fetching, business rules, feature-specific logic |
| **Hooks** | Reusable stateful logic (e.g., `useUnlockStatus`, `useGameProgress`, `useReducedMotion`) — the bridge between components and services/state | Rendering/JSX-adjacent concerns, direct fetch calls without going through the API layer |
| **Services** | Typed API client functions per domain (mirroring Prompt 4's API groups), pure data-fetching logic | UI state, component lifecycle concerns |
| **Utilities** | Pure, stateless helper functions (formatting, calculations, small transforms) | Anything touching React state, context, or side effects |
| **State** | Zustand stores (Prompt 1, Section 8) and React Query configuration | Duplicated server data (server state lives in React Query only) |
| **Assets** | Local fallback/critical-path assets only (fonts, a handful of always-needed icons) | Bulk media — that's Cloudinary via MediaAsset, never bundled locally |

---

## Section 2 — User Experience Architecture

The User Website is structured as a **sequence of scenes bound together by the Journey Progression Engine** (Prompt 3/4's JourneyStage + UnlockCondition system), not a conventional multi-page site.

**Entry experience:** a minimal, near-empty first screen (per Prompt 2, Section 6's "Arrival" stage) — deliberately restrained, a single glowing point of interaction, no heavy asset loading required to see *something* happen immediately.

**Intro sequence:** a choreographed, largely non-interactive (or lightly interactive) sequence establishing tone — architecturally, this is a self-contained feature that transitions the visitor into the World Map on completion or skip; it reads JourneyProgressLog to determine whether a returning visitor should see it again or skip straight to their resume point.

**World Map:** the central navigation hub — a feature that queries the Public Experience API for the visitor's current JourneyStage/UnlockedItem state and renders available nodes (Timeline, Gallery, Games, Secret Room, etc.) accordingly; locked nodes render as present-but-inaccessible (per Prompt 4, Section 14's "invisible vs. locked" distinction — actually, note: nodes *representing* known stages can be visibly teased even if their *content* is locked, since the World Map itself is structural navigation, not content delivery — this distinction matters and should be respected by future prompts).

**Memory exploration:** Timeline and Gallery features, each independently routable from the World Map, both ultimately rendering Memory/MediaAsset data filtered through the same published+unlocked contract from Prompt 4.

**Games:** a Game Hub feature listing available games (per catalog data), each game launched into a shared `GameShell` (Prompt 1, Section 11) that the individual game module plugs into.

**Achievements:** a cross-cutting overlay/panel (not a standalone scene) reachable from anywhere, reflecting AchievementProgress data — surfaced contextually (a toast/notification on earn) and cumulatively (a dedicated achievements panel for browsing what's been earned).

**Final birthday celebration:** the climax scene (Castle → Final Surprise, per Prompt 2's mood curve) — architecturally the "heaviest" scene (most animation/Three.js budget per Prompt 1, Section 14), reached only once its JourneyStage's UnlockCondition is satisfied, and intentionally built as a one-directional narrative payoff rather than a hub the visitor bounces in and out of repeatedly.

**How the visitor moves through the experience:** navigation is **node-based and progression-gated**, not free-form URL browsing — the World Map is the primary hub, features are entered from it and typically return to it on exit, and the Journey Progression Engine (client-side reflection of Prompt 4's backend state) determines what's reachable at any given moment. Deep-linking/routing (Section 9) still exists for technical necessity (shareable state, browser back/forward) but the *felt* experience is hub-and-spoke, not a flat page hierarchy.

---

## Section 3 — Admin Application Architecture

The Admin Dashboard is a **conventional, efficiency-oriented CMS application** structured around Prompt 4's Admin Content API groups, sharing design tokens with the User Website but not its scene-based navigation model.

**Authentication screen:** a standalone, minimal entry point (login form) — not part of the main app shell, rendered before any protected layout mounts.

**Dashboard:** the landing view post-login — overview cards reflecting content counts/recent activity (per Prompt 2, Section 15), acting as a launch point into each module.

**Content managers:** one feature module per content domain (Photos, Albums, Timeline, Quotes, Memories, Letters, Voice Notes, Videos, Games, Unlock Conditions, Music, Backgrounds, Themes, Secret Messages, Access Control, Settings) — each following the shared **List → Editor → Preview** pattern established in Prompt 2, Section 4/15, so the architecture only needs to be "learned" once and applies uniformly across 16+ modules.

**Media management:** a semi-shared feature (an upload/picker component consumed *by* other content managers, e.g., selecting a photo while editing a Memory) rather than only a standalone "Media Library" screen — reflecting that MediaAsset (Prompt 3/4) is a cross-cutting resource, not a single feature's exclusive concern.

**Timeline editor:** a specialized content manager with additional chronological-ordering/drag-reorder UX beyond the generic List→Editor pattern, given Timeline's inherently sequential nature.

**Game configuration:** the Games module plus a nested Unlock Conditions rule-builder (Prompt 4, Section 8) — architecturally the most complex admin feature, since it must expose composite AND/OR condition building without exposing raw data-model complexity to the admin.

**Settings:** a flat, form-based feature for global configuration (site-wide password, feature toggles) — no List/Editor pattern needed, just a single settings form.

**Analytics:** a read-only dashboard feature consuming Prompt 4's Analytics read APIs, rendering aggregate visualizations — no create/edit capability at all.

**Separation from the User Experience:** the two applications are **entirely separate Vite/React builds** (per Prompt 1, Section 3) sharing only design tokens (Section 5) and possibly a generated-types package — they do not share routing, state stores, or feature code. This separation is deliberate: the Admin app optimizes for repeated, efficient data entry (Prompt 2, Section 15's "restraint" principle), while the User app optimizes for immersive, one-directional narrative pacing — conflating them architecturally would compromise both.

---

## Section 4 — Component Architecture

| Layer | Examples | Responsibility |
|---|---|---|
| **Global components** | `SceneLayout`, `GlobalOverlays` (music player, particles layer, unlock toast), `ThemeProvider`-consuming wrapper | Cross-cutting chrome and providers every scene/page relies on |
| **Experience components** | `WorldMapNode`, `JourneyProgressHUD`, `SceneTransition` | Navigation and progression-visualization, specific to the User Website's narrative shell |
| **Memory components** | `MemoryCard`, `TimelineEventCard`, `FloatingPolaroid`, `LetterEnvelope`, `PhotoLightbox` | Rendering content entities (Memory, Letter, MediaAsset) per Prompt 2's photo/letter treatment |
| **Game components** | `GameShell`, `GameHUD`, `GameMenuTile`, `LevelSelector`, `RewardBurst` | Shared game chrome consumed by every individual game module (Prompt 1, Section 11) |
| **Animation components** | `ParticlesLayer`, `AmbientBackground`, motion-primitive wrapper components (`FadeInUp`, `FloatLoop`) | Encapsulate the animation orchestration layer (Section 10) so raw Framer Motion/GSAP calls aren't scattered inline |
| **UI components** | `Button`, `Card`, `GlassPanel`, `Modal`, `Tooltip`, `Badge`, `ProgressBar` | Prompt 2 Section 4's design component language, implemented as the shared low-level UI kit both apps can draw from |
| **Admin components** | `ContentList`, `ContentEditorForm`, `LivePreviewPane`, `MediaPicker`, `UnlockRuleBuilder`, `DataTable` | Admin-specific functional UI, prioritizing clarity/speed per Prompt 2 Section 15 |

**Responsibility principle:** UI components are the *only* layer with zero domain knowledge — a `Card` doesn't know what a Memory is; a `MemoryCard` (Memory component layer) composes a `Card` (UI layer) with Memory-specific content and behavior. This keeps the low-level UI kit reusable across both applications while domain meaning lives one layer up.

---

## Section 5 — Design System Implementation Strategy

Translating Prompt 2's design language into reusable frontend systems:

**Theme handling:** the backend-delivered Theme data (Prompt 3/4, Section 9) is resolved by a client-side **Theme Engine** into CSS custom properties applied at the application root — components consume design tokens exclusively via these variables (Tailwind configured to read from them), never hardcoded values, so an admin-authored theme change requires zero frontend redeployment.

**Typography:** the six type categories from Prompt 2, Section 3 are implemented as a small, fixed set of typography *roles* (not raw font-family references) in the token system — components reference the role ("heading," "handwritten," "game-hud"), and the actual font mapping is theme-data-driven, keeping the same separation-of-concerns as color.

**Colors:** the full palette (Prompt 2, Section 2) is implemented as semantic tokens (primary/secondary/accent/glow/reward, etc.) rather than raw hex references anywhere in component code — this is what enforces the "gold is reserved for rewards" rule structurally rather than by convention alone.

**Spacing:** Prompt 2, Section 16's conceptual spacing scale is implemented as a fixed token scale consumed via Tailwind's spacing configuration — no arbitrary/one-off spacing values in component implementation.

**Effects (glow, shadow, glass):** implemented as reusable style-composition utilities/tokens (glow levels, shadow levels per Prompt 2 Section 16) rather than each component inventing its own shadow/glow values — this is what keeps the 4-tier glow system (off/idle/active/celebratory) consistent across dozens of components.

**Animation patterns:** the motion primitives referenced in Section 4 (fadeInUp, floatLoop, sparkleBurst, pageTransition) are implemented once, centrally, as the *only* sanctioned way components request "standard" motion — matching Prompt 1, Section 9 and Prompt 2, Section 7's duration/easing guidelines by construction rather than by each implementer remembering the rules.

**Overall strategy:** the design system becomes a **token + primitive-component library** sitting beneath both applications — Prompt 2's document defines the rules; this layer is where those rules become the *only path of least resistance* for anyone implementing a new screen, which is what actually guarantees consistency across a 20+ prompt build.

---

## Section 6 — State Management Architecture

Extending Prompt 1, Section 8's three-way split into full detail for this phase:

| State Category | Owned By | Examples | Notes |
|---|---|---|---|
| **Server state** | React Query | Memory/Letter/Album content, Game/GameLevel catalog, Theme data, Analytics reads (admin) | Always fetched via typed Service-layer API clients; never copied into Zustand |
| **Application state** | Zustand (app-level stores) | Active Theme resolution, Audio playback state, global feature flags | Long-lived, app-wide, not tied to a specific scene |
| **Experience state** | Zustand (`useProgressionStore`) | Current journey position (client-side reflection), locally-cached unlock status for instant UI response | Client cache of backend-authoritative state (Section 7) — always reconcilable against a fresh fetch |
| **Game state** | Local component/feature state (not global) | In-progress game state (current puzzle configuration, timer, moves) | Ephemeral, scoped to the active game session, discarded on exit unless explicitly persisted via a progress-save API call |
| **UI state** | Zustand (`useUIStore`) or local component state | Modal open/closed, active tooltip, mobile nav expanded | Transient, presentation-only, never persisted |

**Boundary rule (reaffirmed from Prompt 1):** if data originates from the backend, React Query owns the canonical copy; Zustand may hold a *derived or cached-for-speed* reflection (Section 7) but must never be the sole source of truth for anything the backend also tracks.

---

## Section 7 — User Journey State

**Current location:** derived from routing state (Section 9) reconciled with the backend's JourneyProgressLog on load — the frontend does not invent its own notion of "where the visitor is" independent of what the backend has recorded.

**Unlocked areas:** fetched from the Public Experience/Progress APIs (Prompt 4) on relevant events (scene entry, game completion) and cached client-side in `useProgressionStore` for instant UI feedback (e.g., immediately showing an unlock animation without waiting on a full page reload) — but any authoritative decision (can this visitor actually access this content) is re-verified server-side on the actual content-fetch request, never trusted purely from client cache.

**Completed games:** reflected from GameProgress data (React Query-fetched), with the local Game state (Section 6) reporting completion via the Progress API immediately on game end — the frontend never marks something "complete" in a way that only exists client-side.

**Achievements:** same pattern — AchievementProgress is backend-authoritative; the frontend surfaces earn-moments reactively (e.g., via a response payload or a subsequent fetch after a triggering action) rather than calculating achievement logic itself.

**Progress indicators:** (Love Meter, Love Counter, World Map completion rings) computed as *presentation* over the same underlying UnlockedItem/AchievementProgress/GameProgress data already fetched — no separate "progress calculation" system independent of the real records.

**Resume experience:** on app load, the frontend fetches current journey/unlock state for the stored VisitorSession token (Prompt 4, Section 9) and initializes `useProgressionStore` from that response — resume is simply "load real state," not a special-cased flow.

**"Backend is source of truth" — architectural consequence:** the frontend is permitted to *optimistically* update local progression state for perceived responsiveness (e.g., instantly showing a reward animation after a game win, before the server round-trip confirms), but must always be prepared to reconcile/correct that local state against the next authoritative fetch — no frontend-only progression logic should ever produce a *permanent* state divergence from the backend.

---

## Section 8 — Data Fetching Architecture

**How the frontend communicates with the backend:** exclusively through the typed Service-layer API clients (Section 1), each wrapped in React Query hooks scoped to the API groups defined in Prompt 4, Section 3 — feature code never calls `fetch`/raw HTTP directly.

**Content loading:** React Query manages request deduplication, background refetching, and stale-while-revalidate behavior — content queries are scoped/keyed by the relevant identifiers (VisitorSession, JourneyStage, content ID) so cache invalidation is precise rather than "refetch everything."

**Caching:** aligns with Prompt 4, Section 16's backend caching guidance — relatively static content (Theme, published catalog structure) gets longer client-side stale times; visitor-specific progression data uses short/no stale time and is invalidated immediately after any mutating action (game completion, unlock event) so the UI never shows stale gating state.

**Error handling:** a consistent, on-brand (per Prompt 2) error presentation layer — network/content errors never surface as raw technical messages; the storybook tone (Section 1's design system implementation) extends even to failure states ("this memory is having trouble loading" rather than a generic HTTP error).

**Loading states:** per Prompt 2, Section 7's "in-world" loading guidance — loading indicators are ambient/thematic (a drifting particle, a shimmer) rather than generic spinners, implemented as a shared loading-state component consumed wherever content is being fetched.

**Offline considerations:** given this is a personal, single-recipient experience (not a mission-critical app), full offline support is out of scope — but graceful *degradation* matters: a lost connection mid-experience should surface a clear, friendly retry state rather than a silent failure or broken UI, and any in-progress local game state (Section 6) should survive a brief connectivity blip without losing visitor progress unnecessarily.

---

## Section 9 — Routing Architecture

**Public experience routes:** scene-based routes under the User Website app (World Map, Timeline, Gallery, Letters, Games, Secret Room, Castle, Final Surprise) — route access is **progression-gated**, not purely URL-based: navigating directly to a scene's URL still requires the underlying JourneyStage/UnlockCondition to be satisfied (checked against fetched state, Section 7), preventing URL-guessing from bypassing the intended narrative pacing.

**Admin routes:** a conventional route tree under the Admin Dashboard app, one route (or route group) per content manager module (Section 3), nested under a protected layout.

**Protected routes:** Admin routes require a valid authenticated session (Section 17) — unauthenticated access redirects to the login screen; User Website routes require a valid VisitorSession (and, where applicable, the site-wide password gate from Prompt 3/4) but never admin-level authentication — these are two structurally different protection mechanisms, never conflated (echoing Prompt 4, Section 15's password-type separation).

**Route protection strategy:** implemented as a layout-level guard (a wrapping route component that checks auth/session/unlock state before rendering its children) rather than scattered per-page checks — consistent with the "fail fast at the boundary" principle from Prompt 4, Section 4/14.

---

## Section 10 — Animation Architecture

Reaffirming and detailing Prompt 1, Section 9 and Prompt 2, Section 7 for frontend implementation:

- **Framer Motion:** component-level entrance/exit, hover/tap micro-interactions, layout animations tied to React component lifecycle — the default choice for anything scoped to a single component's mount/unmount/interaction state.
- **GSAP:** multi-step choreographed sequences requiring precise timeline control (scene transitions, the intro sequence, reveal sequences in the Castle/Final Surprise scenes) — used where a sequence needs to be authored as a single coordinated timeline rather than composed from independent component animations.
- **Three.js:** reserved narrowly for the handful of high-impact "wow" moments identified in Prompt 2 (Castle reveal, Final Surprise) — always implemented with a capability-check fallback (Prompt 1, Section 15) and never as a default rendering approach elsewhere.
- **Lottie:** pre-authored vector animations for specific illustrated moments (character animations, celebratory icon sequences) where hand-crafted motion design is more practical than parametric animation.
- **CSS animations:** simple, low-cost, looping ambient effects with no React-state dependency (idle glow pulses, background gradient drifts) — the cheapest tool, reserved for genuinely simple, state-independent loops.

**Avoiding performance problems:**
- Ambient/background animation (particles, aurora) is isolated from the React render tree (Canvas-based `ParticlesLayer`, Section 4) so it never triggers component re-renders.
- Animation complexity scales down under the reduced-motion and mobile/low-end-device paths (Prompt 1 Section 9, Section 14 below) — this is a hookable, testable capability check, not an afterthought.
- GSAP timelines and Three.js scenes are properly torn down on scene/component unmount (no orphaned animation loops accumulating across a 30–45 minute session).
- Motion primitives (Section 5) are reused rather than each component constructing its own animation config, which also means performance tuning happens in one place, not dozens.

---

## Section 11 — Game Frontend Architecture

Extending Prompt 1/4's `GameShell` contract into full frontend detail.

**Universal framework:** `GameShell` provides shared chrome (HUD, timer, pause, win/lose modal, reward animation) and lifecycle plumbing; each individual game (Memory Match, Sliding Puzzle, Jigsaw, Hidden Objects, Cupid Arrow, Cake Catch, Cute Battle, Endless Runner, Treasure Hunt, Relationship Quiz) implements a small, consistent contract (`init`, `render/play`, `onComplete`, `getScore`) that `GameShell` hosts uniformly — this is the frontend counterpart to Prompt 4 Section 10's backend/frontend boundary (backend never knows game-specific rules; frontend never invents its own progress-recording format).

**Game loading:** games are lazy-loaded, code-split route/feature chunks (Section 16) — the Game Hub only loads a specific game's implementation when the visitor actually launches it, not upfront.

**Game lifecycle:** `not started → loading → in progress (paused ⇄ active) → completed/failed → reward/summary` — `GameShell` owns transitions between these states; individual games only signal `onComplete`/failure, they don't manage the surrounding lifecycle chrome themselves.

**Score handling:** each game computes its own score via `getScore` per its internal rules; `GameShell` is responsible for submitting that score to the backend (Section 8/Prompt 4 Section 10) — individual games never call the API directly, keeping the score-submission/validation contract centralized and consistent.

**Level handling:** `GameShell` (or a thin level-selection feature sitting in front of it) fetches GameLevel catalog data and passes the selected level's configuration into the game's `init` — games consume level config generically rather than hardcoding their own difficulty tiers, matching Prompt 3/4's data-driven level design.

**Rewards:** triggered via the shared `RewardBurst`/celebration components (Section 4) uniformly across all games, invoked by `GameShell` upon a successful completion response from the backend — never implemented per-game.

**Completion reporting:** `GameShell` calls the Progress API's game-completion endpoint (Prompt 4, Section 3) on `onComplete`, then reflects the (backend-confirmed) resulting unlock/achievement state back into `useProgressionStore` (Section 6/7) — completion is only "real" once acknowledged by the backend, though the UI may optimistically animate ahead of that confirmation for responsiveness (Section 7).

---

## Section 12 — Photo Experience Architecture

**Gallery engine:** a feature module querying Album/MediaAsset data (published+unlocked, per Prompt 4 Section 6) and arranging it per Prompt 2, Section 9's scattered/masonry-with-personality layout — layout logic (positioning, rotation variance) is computed client-side over fetched data, not baked into the data itself.

**Memory cards:** composed components (Section 4) binding a Memory record's story/date/media references to the visual card treatment — a thin presentation layer over already-fetched Memory data.

**Photo viewer (lightbox):** a dedicated overlay feature handling focused single-photo viewing, swipe/drag navigation between an album's items, and the ambient-dim-and-blur treatment from Prompt 2, Section 9 — implemented as a globally-mountable overlay (Section 4's `GlobalOverlays` pattern) rather than nested deeply inside the Gallery feature, so it can be triggered from Timeline or Memory cards too.

**Transitions:** photo reveal ("developing") and lightbox cross-fade/zoom transitions are implemented via the shared motion-primitive layer (Section 5/10), not bespoke per-photo-component animation code.

**Interactive photos:** tap/click-to-enlarge, swipe-between-album-items — handled via shared gesture/interaction hooks (Section 14) so the same interaction model works consistently whether triggered from Gallery, Timeline, or a Memory card.

**Lazy loading:** gallery/album queries are paginated (Prompt 4, Section 16) and individual images use native/library-supported lazy-loading (only fetching/rendering media as it approaches viewport), critical given a gallery could hold a large, growing number of photos over the relationship's history.

---

## Section 13 — Media Handling Architecture

**Image loading:** all images resolved through Cloudinary-delivered, responsively-transformed URLs (Prompt 4, Section 7) — the frontend requests appropriately-sized variants per context (thumbnail vs. full-view vs. lightbox) rather than always loading the largest version and downscaling client-side.

**Video handling:** lazy-mounted video players (not auto-loading video bytes until the visitor actually reaches that content), using Cloudinary-delivered adaptive formats where feasible.

**Audio handling:** managed centrally through the Audio Engine (Section 6's application state) — background music, ambient sound, and voice notes/SFX are all resolved through MediaAsset references (Prompt 3/4) and coordinated so overlapping audio (e.g., a voice note playing over background music) follows the ducking/mixing rules implied by Prompt 2, Section 12 (ambient layers stay quiet, never compete with intentional foreground audio).

**Optimization:** entirely delegated to Cloudinary's transformation pipeline (Prompt 4, Section 7) on the backend/delivery side — the frontend's responsibility is *requesting the right variant for the right context*, not performing its own client-side image processing.

**Preloading strategy:** predictive preloading (Prompt 1, Section 14) of the next likely scene/content during idle time — implemented as a background, low-priority fetch/prefetch triggered by World Map adjacency or explicit "next" hints from JourneyStage data, never blocking the currently-active scene's responsiveness.

---

## Section 14 — Responsive Experience Architecture

| Aspect | Desktop | Tablet | Mobile |
|---|---|---|---|
| **Layout** | Full multi-element scene composition | Simplified composition | Single-focus, vertically stacked (re-staged per Prompt 2, Section 13, not just shrunk) |
| **Touch interactions** | N/A (mouse/keyboard primary) | Tap-based equivalents of hover reveals | Tap/press as the sole interaction model |
| **Gesture support** | Optional enhancement (e.g., drag for photo reordering-adjacent interactions) | Swipe for photo/album navigation | Swipe/drag as the primary navigation gesture for Gallery/Lightbox, implemented via shared gesture hooks (Section 12) |
| **Game controls** | Precise pointer-based (drag, click-target) | Larger touch targets, same interaction model as mobile where relevant | Touch-first, simplified control schemes (e.g., tap-to-select over precise drag where feasible), largest hit targets |
| **Animation adjustments** | Full particle density, full Three.js fidelity | Medium particle density | Reduced particle density, Three.js fallback tier (per Prompt 1 Section 15/Section 10 above), shorter/simpler choreographed sequences where device capability warrants |

**Architectural implementation:** responsive behavior is driven by a shared `useBreakpoint`/`useDeviceCapability` hook layer (not scattered CSS media queries alone) so that *behavioral* differences (which interaction model, which animation tier) — not just layout — can respond consistently to device context across every feature.

---

## Section 15 — Accessibility Architecture

- **Keyboard navigation:** every interactive element (World Map nodes, buttons, modals, feasible game controls) is reachable via a logical tab order, implemented through standard focusable elements and explicit `tabIndex`/focus-management in custom interactive components (e.g., a custom World Map node), not relying on default browser behavior alone for non-standard UI.
- **Screen reader considerations:** meaningful alt text (sourced from MediaAsset's alt-text field, Prompt 3 Section 3) on all images; semantic structure/ARIA labeling on custom components (progress indicators, game HUD) so their state is announced meaningfully, not just visually implied.
- **Reduced motion mode:** a global `useReducedMotion` hook (Section 10) gates ambient/heavy choreography app-wide, swapping to simpler fade-based equivalents — implemented once, centrally, so every feature automatically inherits this behavior rather than each needing its own check.
- **Text readability:** typography scale/contrast rules from Prompt 2, Section 14 enforced via the token system (Section 5) — decorative fonts (script/handwritten) never used for lengthy required-reading content, per that same rule.
- **Audio alternatives:** persistent mute/volume control (Section 6's Audio Engine exposes this state globally) mounted from the very first scene (`GlobalOverlays`); no content is audio-only without a visual/textual equivalent (e.g., voice notes could pair with an optional transcript field at the content-authoring level, a consideration to flag for the Admin Letters/Voice Notes module design).

---

## Section 16 — Performance Architecture

- **Code splitting:** route/scene-based lazy loading (Section 2's scenes, Section 11's individual games) via dynamic imports — the initial bundle contains only the entry experience and shared shell, not the entire 30–45 minute experience upfront.
- **Lazy loading:** applies to both code (Section above) and media (Section 12/13) — nothing loads until it's about to be needed, informed by predictive preloading for the *likely-next* item specifically (not everything, not nothing).
- **Asset optimization:** enforced by construction — since all bulk media routes through Cloudinary-resolved responsive URLs (Section 13), there's no path for an unoptimized raw asset to end up in a bundle.
- **Animation performance:** ambient/particle rendering isolated outside the React tree (Section 10), GSAP/Three.js instances properly disposed on unmount, motion primitives reused rather than reimplemented per component (reducing both bundle size and runtime animation-object churn).
- **Memory management:** particular attention to a session that may run 30–45+ minutes — audio/video elements and Three.js scenes must be explicitly cleaned up when scenes are exited (not just visually hidden), and long-lived Zustand stores (Section 6) should hold only what's needed for progression continuity, not accumulate unbounded history client-side (that's what backend AnalyticsEvent/JourneyProgressLog logging is for).
- **Bundle optimization:** shared UI kit/token package (Prompt 1's `packages/ui-kit`) deduplicates design-system code between the two applications; heavy libraries (Three.js, GSAP) are loaded only on the code-split chunks that actually use them, never included in the initial/shared bundle.

---

## Section 17 — Security Architecture

- **Admin protection:** the Admin Dashboard's protected route layout (Section 9) enforces authentication before rendering any content-manager screen; the access token (Prompt 4, Section 4) is attached automatically by the API client layer (Section 8) to every Admin Content API request.
- **Token handling:** access tokens held in memory/short-lived storage appropriate to the chosen refresh-token strategy (Prompt 4, Section 4) — the frontend never persists long-lived admin credentials in a way that survives a compromised device beyond the intended session window; refresh flow is handled transparently by the API client layer, not manually by feature code.
- **Sensitive content:** the User Website frontend never fetches or holds locked/unpublished content client-side "just in case" — per Prompt 4 Section 6/14, the backend simply never returns it, so there's nothing sensitive sitting in frontend memory/cache waiting to be exposed through a client-side bug or dev-tools inspection.
- **Client-side limitations (explicitly acknowledged):** any client-side gating (e.g., hiding a World Map node's detail until "unlocked" in local state) is a **UX convenience only**, never a security boundary — the frontend architecture assumes a technically curious visitor could inspect network requests, and relies on Prompt 4's backend-enforced published+unlocked filtering as the *actual* protection, not on the frontend hiding things.
- **Data exposure prevention:** API response shaping (Prompt 4, Section 16 — responses contain only what the consuming app needs) means the frontend is never holding admin-only fields or other visitors' data even in principle; the frontend's own responsibility is simply not to introduce *new* leaks (e.g., accidentally logging full API responses to the browser console in a way that could expose more than intended, or embedding secrets/tokens in client-visible config).

---

## Section 18 — Final Frontend Blueprint Summary

**Complete frontend architecture summary:** two independently-built React/Vite/TypeScript applications share a token-driven design system and a typed API client layer, but differ fundamentally in navigation philosophy — the User Website is a **progression-gated, scene-based narrative shell** (hub-and-spoke around the World Map, paced by the Journey Progression Engine), while the Admin Dashboard is a **conventional, efficiency-oriented CMS** built from one repeated List→Editor→Preview pattern across 16+ content modules. Both are strictly layered (Pages/Scenes → Features → Components → Hooks → Services → Utilities, Section 1) with server state, application state, experience state, game state, and UI state deliberately separated (Section 6) rather than commingled.

**Application relationship:** both applications consume the *same* backend (Prompt 4) through cleanly separated API groups, but neither shares code, routing, or runtime state with the other — their only shared artifacts are design tokens and (optionally) generated TypeScript types, consistent with Prompt 1's decoupled multi-app architecture.

**Component philosophy:** a strict layering from domain-agnostic UI primitives (Section 4's UI components) up through domain-aware composed components (Memory/Game/Admin components) — low-level components never know what a Memory or a Game is; that meaning is added exactly one layer up, keeping the shared UI kit genuinely reusable across both applications.

**State philosophy:** React Query is the *only* source of truth for anything the backend tracks; Zustand exists purely for client/interaction/derived-for-speed state; the frontend is architecturally forbidden from inventing its own permanent notion of visitor progress independent of what the backend has recorded (Section 7) — optimistic UI is allowed, permanent divergence is not.

**Animation philosophy:** every animation is sourced from a shared motion-primitive layer (Section 5/10) rather than invented per component, with tool selection (Framer Motion/GSAP/Three.js/Lottie/CSS) matched deliberately to scope and narrative weight, and reduced-motion/mobile fallbacks treated as first-class paths, not retrofits.

**Game architecture philosophy:** one universal `GameShell` contract hosts every game; individual games own only their internal play logic, never chrome, scoring-submission, or reward presentation — this is what makes "add an 11th game" a scoped, contained addition rather than a systemic change (mirroring Prompt 4 Section 10's backend-side version of the same principle).

**How the frontend connects the full stack:**

```
Admin (Admin Dashboard frontend)
   ↓  [typed Service-layer clients → Admin Content APIs, authenticated]
Backend (Prompt 4 — Application/Service/Domain layers enforce rules,
         Unlock Engine evaluates, Content Status governs visibility)
   ↓  [Data Access Layer]
Database (Prompt 3 — full data model; MediaAsset/Cloudinary indirection;
          UnlockCondition as the gating pivot)
   ↓  [Public Experience / Progress / Game APIs → React Query → 
       useProgressionStore / feature state]
User Experience (User Website frontend — scenes, components, and
                  animation rendering exactly what Prompt 4 determined
                  this visitor has published-and-unlocked access to,
                  styled entirely through Prompt 2's design system)
```

Every frontend decision in this document exists to render, exactly and only, what the backend has determined the visitor has earned — and to do so through the emotional, magical visual language defined in Prompt 2, without ever becoming the source of truth for progression itself.

---

**Waiting for Prompt 6.**
