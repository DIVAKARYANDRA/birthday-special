# "The Journey To My Heart" — Architectural Blueprint
### Prompt 1 Deliverable — Architecture Only, No Code

---

## 1. Overall Project Vision

"The Journey To My Heart" is a **narrative-driven, gamified web experience** built as a birthday gift — not a website in the traditional sense, but an interactive storybook-world the visitor walks through over 30–45 minutes.

Core vision pillars:

- **Story-first architecture**: Every screen is a "scene" in a larger narrative arc (Arrival → Discovery → Trials → Revelation → Celebration). Technical structure should mirror this narrative structure, not fight it.
- **Progression-driven engagement**: Nothing is dumped on the user at once. Content, memories, and games unlock progressively, creating anticipation — this drives both the emotional pacing and the technical architecture (unlock-state machine).
- **Content without code**: Every romantic/personal detail (photos, letters, quotes, timeline events) lives in the CMS, never hardcoded. The frontend is a *rendering engine* for admin-authored content, not a static site.
- **Premium motion design**: Animation is treated as a first-class architectural concern (its own layer), not an afterthought sprinkled via CSS.
- **Two products, one source of truth**: The Admin Dashboard and User Website are separate applications sharing one backend/data contract, so content changes propagate without redeployment of the experience itself.

---

## 2. Software Architecture

**Pattern: Decoupled multi-app architecture with a shared backend contract.**

```
┌─────────────────────┐        ┌─────────────────────┐
│   User Website       │        │   Admin Dashboard     │
│   (React/Vite SPA)   │        │   (React/Vite SPA)    │
└──────────┬───────────┘        └──────────┬───────────┘
           │  REST (React Query)            │  REST (React Query)
           └───────────────┬────────────────┘
                            │
                  ┌─────────▼─────────┐
                  │   FastAPI Backend  │
                  │  (modular routers) │
                  └─────────┬─────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼───────┐  ┌────────▼────────┐  ┌───────▼───────┐
│  PostgreSQL     │  │   Cloudinary     │  │  JWT Auth      │
│  (content, state)│  │  (media storage) │  │  (admin + user)│
└─────────────────┘  └──────────────────┘  └────────────────┘
```

**Architectural layers within each frontend app:**

1. **Presentation layer** — pages/scenes, purely visual composition.
2. **Feature/domain layer** — self-contained modules (timeline, gallery, games, letters) each with their own components, hooks, and store slices.
3. **Data layer** — React Query hooks wrapping typed API clients.
4. **State layer** — Zustand stores for client/UI/progression state, React Query cache for server state (strict separation — never duplicate server state into Zustand).
5. **Animation layer** — a dedicated orchestration layer (see Section 9) sitting above raw Framer Motion/GSAP calls.

**Backend architecture (FastAPI):** modular-monolith, organized by domain (not by technical layer), with routers → services → repositories → models. This keeps it scalable enough to later split into microservices if ever needed, without over-engineering now.

---

## 3. Folder Structure

```
journey-to-my-heart/
├── apps/
│   ├── web/                     # User Website (magical experience)
│   │   ├── src/
│   │   │   ├── app/              # App shell, providers, router config
│   │   │   ├── scenes/           # Top-level narrative scenes (Landing, WorldMap, Castle...)
│   │   │   ├── features/         # Domain modules
│   │   │   │   ├── timeline/
│   │   │   │   ├── gallery/
│   │   │   │   ├── letters/
│   │   │   │   ├── voice-notes/
│   │   │   │   ├── games/
│   │   │   │   │   ├── memory-match/
│   │   │   │   │   ├── sliding-puzzle/
│   │   │   │   │   ├── jigsaw/
│   │   │   │   │   ├── hidden-objects/
│   │   │   │   │   ├── cupid-arrow/
│   │   │   │   │   ├── cake-catch/
│   │   │   │   │   ├── cute-battle/
│   │   │   │   │   ├── endless-runner/
│   │   │   │   │   ├── treasure-hunt/
│   │   │   │   │   └── relationship-quiz/
│   │   │   │   ├── secret-room/
│   │   │   │   ├── love-meter/
│   │   │   │   └── final-surprise/
│   │   │   ├── components/       # Shared, presentation-only UI primitives
│   │   │   ├── animations/       # Animation orchestration layer
│   │   │   ├── theme/            # Theme tokens, theme engine
│   │   │   ├── stores/           # Zustand stores (progression, audio, theme, ui)
│   │   │   ├── api/              # Typed API clients + React Query hooks
│   │   │   ├── lib/              # Utilities, helpers
│   │   │   ├── types/            # Shared TS types (or generated from backend schema)
│   │   │   └── assets/           # Local fallback assets only (bulk media in Cloudinary)
│   │   └── vite.config.ts
│   │
│   └── admin/                    # Admin Dashboard (CMS)
│       ├── src/
│       │   ├── app/
│       │   ├── modules/          # One module per content type (mirrors admin features list)
│       │   │   ├── photos/
│       │   │   ├── albums/
│       │   │   ├── timeline/
│       │   │   ├── quotes/
│       │   │   ├── memories/
│       │   │   ├── letters/
│       │   │   ├── voice-notes/
│       │   │   ├── videos/
│       │   │   ├── games/
│       │   │   ├── unlock-conditions/
│       │   │   ├── music/
│       │   │   ├── backgrounds/
│       │   │   ├── themes/
│       │   │   ├── secret-messages/
│       │   │   ├── access-control/
│       │   │   ├── analytics/
│       │   │   └── settings/
│       │   ├── components/
│       │   ├── stores/
│       │   ├── api/
│       │   └── types/
│       └── vite.config.ts
│
├── services/
│   └── api/                      # FastAPI backend
│       ├── app/
│       │   ├── main.py
│       │   ├── core/             # config, security, JWT, exceptions
│       │   ├── db/                # session, base models, migrations (Alembic)
│       │   ├── domains/           # one folder per domain
│       │   │   ├── photos/
│       │   │   ├── albums/
│       │   │   ├── timeline/
│       │   │   ├── quotes/
│       │   │   ├── memories/
│       │   │   ├── letters/
│       │   │   ├── voice_notes/
│       │   │   ├── videos/
│       │   │   ├── games/
│       │   │   ├── unlocks/
│       │   │   ├── music/
│       │   │   ├── themes/
│       │   │   ├── secret_messages/
│       │   │   ├── auth/
│       │   │   ├── analytics/
│       │   │   └── settings/
│       │   │       # each domain: router.py, service.py, repository.py,
│       │   │       # schemas.py (pydantic), models.py (SQLAlchemy)
│       │   └── shared/           # cross-domain utilities
│       └── alembic/
│
├── packages/                     # Shared code between web + admin (optional, phase-2)
│   ├── ui-kit/                   # Shared design tokens / primitive components
│   └── types/                    # Shared TS types generated from OpenAPI schema
│
└── infra/                        # Deployment configs, env templates, CI/CD
```

**Key principle:** the `features/`/`modules/` folders are **vertical slices** — everything related to "Timeline" (components, hooks, store slice, API calls, types) lives together, not scattered across horizontal technical folders. This is what keeps a 30–45 minute, content-heavy experience maintainable as it grows.

---

## 4. Module Breakdown

**User Website domains:**
| Module | Responsibility |
|---|---|
| Landing/Intro | First impression, animated entry sequence, sets tone |
| World Map | Central navigation hub, node-based progression |
| Timeline | Chronological relationship story |
| Gallery | Photos, albums, floating polaroids |
| Letters | Love letters, reveal/reading experience |
| Voice Notes | Audio playback experience |
| Games | Self-contained mini-game engine + 10 game modules |
| Secret Room | Gated content requiring unlock conditions |
| Castle/Final Surprise | Climax scene, culmination of progression |
| Love Meter/Counter | Cross-cutting progression visualization |
| Progression Engine | Tracks unlocks, saves state, gates content (cross-cutting) |
| Theme Engine | Applies admin-defined visual themes globally (cross-cutting) |
| Audio Engine | Background music, SFX, voice playback (cross-cutting) |

**Admin Dashboard domains:** one module per content type listed in Section 3 above, each following the same CRUD-oriented internal pattern (List → Editor → Preview), plus:
- **Unlock Conditions module** — a rule-builder UI to define what gates what (e.g., "Secret Room unlocks after 3 games completed").
- **Analytics module** — read-only dashboards over visitor progression events.
- **Settings module** — global config (site title, password protection, feature toggles).

---

## 5. Component Hierarchy (User Website, representative)

```
App
└── AppProviders (Theme, Query, Auth/Session, Audio)
    └── AppRouter
        └── SceneLayout (per-scene chrome: ambient background, particles, nav)
            ├── LandingScene
            │   ├── AnimatedIntro
            │   └── EntryCTA
            ├── WorldMapScene
            │   ├── MapCanvas
            │   ├── MapNode (repeated: Timeline, Gallery, Games, SecretRoom...)
            │   └── ProgressionHUD (LoveMeter, LoveCounter)
            ├── TimelineScene
            │   ├── TimelineTrack
            │   └── TimelineEventCard (repeated)
            ├── GalleryScene
            │   ├── AlbumGrid
            │   ├── FloatingPolaroid (repeated)
            │   └── PhotoLightbox
            ├── LettersScene
            │   ├── LetterEnvelope
            │   └── LetterReader
            ├── GameHubScene
            │   └── GameShell (generic wrapper: HUD, timer, rewards)
            │       └── [Specific Game] (MemoryMatch, SlidingPuzzle, ...)
            ├── SecretRoomScene (gated)
            ├── CastleScene
            └── FinalSurpriseScene
        └── GlobalOverlays (MusicPlayer, ParticlesLayer, UnlockToast)
```

**Design rule:** `SceneLayout` owns ambient/background animation; individual scenes never manage global particles/aurora themselves — this avoids animation logic duplication and layout thrash.

---

## 6. Database Overview (PostgreSQL, conceptual)

Grouped by domain, not exhaustive column-level detail (that comes in the relevant future prompt):

- **content**: `photos`, `albums`, `album_photos`, `timeline_events`, `quotes`, `memories`, `letters`, `voice_notes`, `videos`
- **experience**: `games`, `game_levels`, `game_progress` (per visitor session), `achievements`, `unlock_conditions`, `unlock_state`
- **presentation**: `themes`, `theme_assets`, `backgrounds`, `music_tracks`, `secret_messages`
- **access**: `admin_users`, `visitor_sessions`, `access_passwords`
- **system**: `analytics_events`, `settings` (key-value config)

**Relationship notes:**
- `unlock_conditions` is a **rules table** referencing target content (polymorphic: scene/game/letter) and required prerequisite events — this is what lets admins configure gating without code.
- `visitor_sessions` + `game_progress` allow **resumable progress** (important for a 30–45 min experience — visitors may return).
- `analytics_events` is an append-only event log (scene entered, game completed, letter opened) powering the Admin Analytics module.

Migrations managed via **Alembic**, one migration per schema change, never manual DB edits.

---

## 7. API Overview

RESTful, versioned (`/api/v1/...`), organized by domain to mirror backend folder structure.

Representative surface (illustrative, not exhaustive):

- `GET /content/timeline`, `GET /content/gallery/albums/{id}`, `GET /content/letters/{id}`
- `GET /experience/games`, `POST /experience/games/{id}/progress`, `GET /experience/unlocks/status`
- `GET /presentation/theme/active`, `GET /presentation/music/playlist`
- `POST /auth/admin/login`, `POST /auth/visitor/verify-password`
- `POST /analytics/events` (fire-and-forget tracking)
- Full CRUD (`GET/POST/PUT/DELETE`) under `/admin/*` for every content module, JWT-protected.

**Design rules:**
- Public/user-facing endpoints are **read-optimized and heavily cacheable**; admin endpoints are CRUD-standard.
- Progression writes (`game progress`, `unlock status`) go through **dedicated, idempotent endpoints** — never generic PATCH — because they encode business rules (a game can't "un-complete" itself).
- OpenAPI schema auto-generated by FastAPI becomes the **contract source of truth**, ideally driving generated TypeScript types for both frontends (Section 3's `packages/types`).

---

## 8. State Management Strategy

Strict three-way split:

1. **Server state → React Query.** All content from the API (photos, letters, timeline, theme config). Never copied into Zustand. Cached, revalidated, and the single source of truth for "what does the backend say."
2. **Client/UI state → Zustand**, split into focused stores:
   - `useProgressionStore` — unlocked scenes/games, current narrative position (persisted to backend via API + local optimistic cache)
   - `useAudioStore` — music playback state, volume, current track
   - `useThemeStore` — active theme, resolved from server config but held locally for instant application
   - `useUIStore` — modals, overlays, transient UI flags
3. **Form state → React Hook Form**, scoped locally to admin editor forms; never lifted into global state.

**Rule:** no store should ever hold data that React Query already owns — Zustand stores hold *derived/interaction* state, not duplicated server data. This prevents the classic dual-source-of-truth bugs.

---

## 9. Animation Architecture

Because animation is central to this product (not decorative), it gets its own architectural layer rather than being scattered inline.

- **Orchestration layer (`animations/`)**: defines reusable *motion primitives* (fadeInUp, floatLoop, sparkleBurst, pageTransition) as Framer Motion variants/GSAP timelines, consumed by components — components never hand-roll animation configs inline.
- **Three tiers of motion:**
  1. **Micro-interactions** (button hover, card tilt) → Framer Motion, component-local.
  2. **Scene choreography** (intro sequences, reveal sequences, scene transitions) → GSAP timelines, coordinated centrally per scene.
  3. **Ambient/background** (particles, fireflies, aurora, floating hearts) → a dedicated `ParticlesLayer` (Canvas or lightweight Three.js), performance-isolated from the DOM/React tree so it doesn't trigger re-renders.
- **Three.js is scoped narrowly**: only for specific "wow" moments (e.g., Castle reveal, Final Surprise) — never as the default rendering approach, to protect performance and mobile compatibility.
- **Reduced-motion support** is architected in from the start: a global `useReducedMotion` check gates ambient/heavy effects, swapping to simpler transitions — required for accessibility and low-end devices.

---

## 10. Theme Architecture

- Themes are **data, not code**: defined in the DB (colors, gradients, particle presets, font pairing, background asset references) and delivered via `/presentation/theme/active`.
- Frontend has a **Theme Engine** that resolves theme JSON → CSS custom properties (Tailwind reads CSS variables, not hardcoded values) → applied at the root, so every component automatically inherits theme changes with zero code changes.
- Supports **scene-level theme overrides** (e.g., Secret Room has a moodier palette) layered on top of the global theme, resolved via a simple override-merge strategy.
- Admin's Themes module edits this data through a visual preview, never touching code — fulfilling the "no-code content management" goal even for visual identity.

---

## 11. Game Architecture

- **Generic `GameShell` wrapper** provides shared chrome: timer, score/HUD, pause, win/lose modal, reward animation, and progress-save hook — every game plugs into this contract instead of reimplementing UI chrome.
- **Game contract (interface)**: each game module exports `{ init, render, onComplete, getScore }`-style hooks so `GameShell` can host any game uniformly. This is what lets 10 different games share one progression/reward pipeline.
- **Progress persistence**: game state syncs to `game_progress` via the dedicated progress API (Section 7), enabling resume and cross-device continuity.
- **Rewards/Achievements** are decoupled from individual games — a central `AchievementsEngine` listens for completion events and evaluates achievement rules (again, data-driven from `unlock_conditions`/`achievements` tables), so adding a new achievement never requires touching game code.
- **Difficulty/levels** are config-driven (level definitions in DB or structured JSON per game) rather than hardcoded, so admins can tune difficulty without redeploys where feasible.

---

## 12. Admin Architecture

- Every content module follows the same internal pattern: **List view → Editor view → Live Preview pane**, giving consistent UX across 17 different content types without reinventing patterns each time.
- **Unlock Conditions module** is the most complex — a rule-builder (trigger + target + condition) since it drives the entire gating system on the user site.
- **Media uploads** go directly to Cloudinary via signed upload URLs issued by the backend (backend never proxies binary uploads), keeping the FastAPI layer lightweight.
- **Role model**: single admin role at launch (simple JWT-authenticated owner), architected so a `roles`/`permissions` table can be added later without refactoring (Section 16).
- **Analytics module** is read-only, visualizing `analytics_events` — no write path from admin into this table.

---

## 13. Security Considerations

- JWT auth for Admin Dashboard (short-lived access token + refresh token), fully separate from the lightweight "visitor password" gate on the user site (different trust levels — do not conflate).
- Visitor-side password protection (for the Secret Room / whole-site gate) is a **low-stakes shared-secret gate**, not a full auth system — architected accordingly (rate-limited, single shared password, no per-user accounts needed).
- All admin endpoints require JWT; all mutating endpoints validate payloads via Pydantic schemas (reject unknown/malformed data at the boundary).
- Signed, time-limited upload URLs for Cloudinary — never expose raw API secrets to the frontend.
- CORS locked to the two known frontend origins.
- Rate limiting on auth and password-verification endpoints to prevent brute force.
- No PII beyond what the couple themselves provides — but treat all uploaded photos/letters/voice notes as sensitive and never expose Cloudinary asset URLs in a way that's publicly guessable/indexable (unlisted delivery, no public gallery indexing).

---

## 14. Performance Strategy

- **Route-based code splitting**: each scene and each game is a lazy-loaded chunk — the 30–45 minute experience must not become a 10MB initial bundle.
- **Media strategy**: Cloudinary responsive transformations (auto-format, auto-quality, sized variants) — never ship raw uploaded images.
- **Animation performance isolation**: ambient particle layers run outside React's render cycle (Canvas/WebGL), preventing re-render storms during heavy motion.
- **React Query caching** minimizes redundant fetches as the user moves between scenes/games.
- **Preloading strategy**: predictive preload of the *next likely scene* (based on world-map adjacency) during idle time, rather than preloading everything upfront.
- **Asset budgets** defined per scene (max image weight, max concurrent Lottie/particle instances) as an explicit non-functional requirement, not an afterthought.

---

## 15. Mobile Strategy

- Mobile-first responsive design using Tailwind breakpoints; World Map and game interactions specifically redesigned for touch (drag/tap targets, not hover-dependent interactions).
- Heavier Three.js/particle effects have **mobile-tier fallbacks** (reduced particle count, simplified shaders, or static imagery) detected via device capability checks, not just screen width.
- Games designed with **touch-first input** as the primary interaction model, mouse/keyboard as an enhancement.
- Audio playback respects mobile autoplay restrictions (require an initial user gesture to start ambient music, architected into the intro scene naturally).

---

## 16. Future Scalability

- Modular-monolith backend can be split into services (e.g., separate media/upload service) later without a rewrite, since domains are already isolated by folder and by repository/service layer.
- `packages/` workspace (shared UI kit + generated types) allows the project to scale into more frontend surfaces later (e.g., a mobile app) without duplicating logic.
- Admin role model has a clear extension path to multi-role/multi-user if ever needed.
- Theme/content data-driven design means the *same* engine could power a different couple's version of this experience in the future with zero code changes — pure content reconfiguration.

---

## 17. Suggested Implementation Order

1. Backend foundation (DB, auth, core domain scaffolding)
2. Admin Dashboard shell + first content modules (Photos, Albums, Timeline)
3. User Website shell (routing, theme engine, base scenes)
4. Progression/unlock engine (backend + frontend state)
5. Gallery + Timeline experiences (consuming real admin content)
6. Letters + Voice Notes experiences
7. Game engine shell, then games one-by-one (simplest → most complex)
8. Secret Room + gating integration
9. Castle + Final Surprise (climax scenes, heaviest animation/Three.js work)
10. Music/audio system integration across the whole experience
11. Analytics module
12. Performance pass, mobile pass, accessibility pass
13. Polish pass (micro-interactions, transitions, sound design)

---

## 18. Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Scope creep across 10 games + 17 admin modules | Strict shared-shell patterns (GameShell, admin List/Editor/Preview pattern) to avoid bespoke work per feature |
| Animation-heavy build hurting performance | Dedicated animation performance isolation (Section 9/14), asset budgets, mobile fallbacks |
| Content/code coupling creeping back in ("just hardcode this one quote") | Discipline: all romantic content must go through CMS/DB, enforced as a standing architectural rule |
| Three.js scenes tanking mobile performance | Narrow, scoped usage only; capability-based fallbacks |
| Long build (20–30 prompts) losing architectural consistency | This document is the persistent reference; every future prompt must explicitly conform to it |
| Visitor losing 30+ minutes of progress | Persisted `visitor_sessions`/`game_progress` from day one, not bolted on later |

---

## 19. Design Principles for Every Future Implementation

1. **Content is data.** If it's personal/romantic, it lives in the DB, editable via admin — never hardcoded.
2. **Vertical slices over horizontal layers.** Features own their components, hooks, state, and API calls together.
3. **Server state and client state never mix.** React Query owns the backend truth; Zustand owns interaction state only.
4. **Animation is orchestrated, not inline.** Reusable motion primitives, tiered by scope (micro/scene/ambient).
5. **Every scene respects the shared `SceneLayout` contract** for ambient background and navigation chrome.
6. **Games share one shell and one progression pipeline** — no bespoke game infrastructure per game.
7. **Themes are swappable data**, never hardcoded colors/fonts in components.
8. **Mobile and reduced-motion are first-class**, not a later retrofit.
9. **Every mutating action that affects progression is idempotent and persisted**, protecting a 30–45 minute session from data loss.
10. **No feature ships without fitting into this architecture** — deviations require explicitly revisiting this blueprint.

---

## 20. Phased Roadmap — Approximately 24 Implementation Prompts

**Phase A — Foundations (Prompts 2–5)**
2. Backend project scaffold: FastAPI structure, config, DB connection, Alembic setup
3. Core DB schema: content domain tables (photos, albums, timeline, quotes, memories, letters)
4. Auth system: admin JWT auth + visitor password gate
5. Frontend project scaffolds: both apps (Vite/TS/Tailwind/routing/providers) wired to a shared type strategy

**Phase B — Admin Dashboard Core (Prompts 6–10)**
6. Admin shell/layout + navigation + auth flow
7. Photos & Albums modules (upload via Cloudinary, list/editor/preview)
8. Timeline & Quotes modules
9. Memories, Letters, Voice Notes, Videos modules
10. Settings + access-control (password) module

**Phase C — User Website Core Experience (Prompts 11–15)**
11. Theme engine + global providers (Query, Zustand stores, Audio)
12. Landing scene + animated intro
13. World Map scene (navigation hub, node system)
14. Timeline scene + Gallery scene (real content-driven)
15. Letters + Voice Notes scenes

**Phase D — Progression & Games (Prompts 16–21)**
16. Progression/unlock engine: backend rules + frontend state integration
17. Admin Unlock Conditions module (rule builder)
18. GameShell + shared game contract/progress pipeline
19. Games batch 1 (Memory Match, Sliding Puzzle, Jigsaw)
20. Games batch 2 (Hidden Objects, Cupid Arrow, Cake Catch)
21. Games batch 3 (Cute Battle, Endless Runner, Treasure Hunt, Relationship Quiz)

**Phase E — Climax & Polish (Prompts 22–24)**
22. Secret Room + Castle scenes (gated content, heavier animation/Three.js)
23. Final Surprise scene + Love Meter/Counter cross-cutting polish
24. Performance, mobile, accessibility, and full animation polish pass

---

### Roadmap Summary

This blueprint establishes a **content-driven, modular, animation-first architecture** across two decoupled frontends and one modular-monolith backend, with a clear ~24-prompt build order moving from foundations → admin core → user experience core → progression/games → climax/polish.

Every future prompt should reference this document as the standing architectural contract. No implementation should introduce a new pattern (state management approach, folder convention, animation strategy) without explicitly reconciling it with what's defined here.

**Waiting for Prompt 2.**
