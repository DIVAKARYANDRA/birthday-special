# apps/web — User Website

The magical, visitor-facing birthday experience. See:
- docs/01-system-architecture.md for the overall vision and roadmap
- docs/02-design-system.md for the visual/motion language this app must follow
- docs/05-frontend-architecture.md for this app's internal architecture

## Status
Real, mobile-first magical experience foundation (Prompt 15) — landing, cinematic intro, World Map (7 locations), Memory Garden, Timeline Train, Photo Gallery, and Letters (minimal placeholder). See `docs/15-public-experience-foundation-status.md` for the full record.

**Important:** every scene's content data (`src/features/*/data.ts`) is currently static placeholder data shaped to match the real backend schemas — no Public Experience API exists yet (only ADMIN APIs exist, per Prompt 14), so this app cannot yet fetch real content. Each `data.ts` file documents this explicitly and is designed to be replaced wholesale once that API exists.

**Architecture:** `AmbientBackground`/`ParticlesLayer` (canvas-based ambient world) → `SceneLayout` (per-scene chrome + BottomNav) → `SceneTransition` (route cross-fades) → lazy-loaded scenes. `useDeviceCapability`/`useReducedMotion`/`useBreakpoint` drive adaptive performance and accessibility throughout. Mobile-first: every layout is designed from a 375px baseline first, with `sm:`/`md:` as progressive enhancement, never the reverse.

Games, Birthday Castle, Final Surprise content, and Secret Room content remain untouched placeholders, per this prompt's explicit exclusions.

## Local setup (once dependencies are installed)
1. Copy `.env.example` to `.env.local` and fill in local values.
2. Install dependencies with the package manager chosen for this project.
3. Run the dev script to start the local server.

Real setup/tooling commands are intentionally not included in this
foundation-phase document — see docs/06-engineering-foundation.md for the
governing environment strategy.
