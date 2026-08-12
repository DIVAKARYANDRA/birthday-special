# Documentation Index — "The Journey To My Heart"

This folder is the project's **living architectural reference**. Every implementation prompt from Prompt 7 onward must be consistent with the decisions recorded here. Nothing in this repository should contradict these documents without an explicit, documented reason.

## Reading order

1. **01-system-architecture.md** — overall vision, software architecture, folder structure, module breakdown, roadmap (Prompt 1)
2. **02-design-system.md** — brand identity, color/typography system, component language, animation/particle systems (Prompt 2)
3. **03-data-architecture.md** — the complete conceptual data model, all entities and relationships (Prompt 3)
4. **04-backend-architecture.md** — backend layering, module architecture, API groups, Unlock Engine design (Prompt 4)
5. **05-frontend-architecture.md** — frontend layering, component architecture, state management, routing (Prompt 5)
6. **06-engineering-foundation.md** — repository structure, environments, coding standards, Git workflow, testing strategy (Prompt 6)
7. **07-foundation-status.md** — record of what the Prompt 7 foundation commit established, the validation checklist, and assumptions made (Prompt 7)
8. **08-backend-foundation-status.md** — the backend platform foundation (config, logging, middleware, error handling, versioned routing) built on top of Prompt 7's scaffold, plus future module integration rules (Prompt 8)
9. **09-database-foundation-status.md** — the database core foundation (connection/session management, ORM base, migration tooling, test database isolation, DB error translation), plus the future model integration checklist (Prompt 9)
10. **10-mediaasset-domain-status.md** — the first real business domain (MediaAsset): model, schemas, repository, service, and a hand-authored migration, plus future integration points for the domains that will reference it (Prompt 10)
11. **11-memory-domain-status.md** — the second real business domain (Memory), its many-to-many relationship to MediaAsset via MemoryMediaItem, the documented cross-domain relationship-validation design decision, and future integration points for Timeline/Gallery/Journey/Unlock Engine (Prompt 11)
12. **12-timeline-domain-status.md** — the third real business domain (Timeline): a storytelling/presentation layer over Memory (Timeline, TimelineChapter, TimelineEntry) supporting multiple simultaneous storytelling experiences over the same Memories, plus future Story Book/World Map/Train Journey integration points (Prompt 12)
13. **13-story-engine-status.md** — the "Story Engine" bundle: five tightly-coupled domains (UnlockCondition, Visitor Progress, Achievement, Letters, Quote) implemented together, including the full validated acyclic cross-domain dependency map and the Unlock Engine's evaluation flow (Prompt 13)
14. **14-admin-platform-status.md** — real JWT authentication, role/permission authorization, 7 admin-only Content APIs, and a functional admin frontend (login, protected routing, dashboard, 7 management screens); documents the one deliberate exception to "existing domains unchanged" (the deferred MediaAsset FK) and two real bugs caught during validation (Prompt 14)
15. **15-public-experience-foundation-status.md** — the mobile-first magical User Website foundation: landing, cinematic intro, World Map, Memory Garden, Timeline Train, Photo Gallery, and the animation/theme/performance systems underneath them; documents that all scene data is placeholder pending a future Public Experience API (Prompt 15)

## How to use this folder during implementation

- Before implementing any new module, feature, or component, check the relevant document above for the architectural decision that already governs it.
- If a future prompt seems to require deviating from a documented decision, that conflict should be raised and resolved explicitly (updating the relevant document) — never silently implemented differently in code.
- This index will grow as future prompts add implementation-specific references (e.g., API contracts, component inventories) alongside the original six architecture documents.

## Project pillars (quick reference)

- **Content-as-data** — nothing visitor-facing is hardcoded; everything is admin-authored.
- **UnlockCondition is the single gating pivot** — every unlock across memories, letters, games, and journey stages routes through one centralized engine.
- **MediaAsset is the Cloudinary indirection layer** — content entities never store raw Cloudinary URLs.
- **Backend is the source of truth for progression** — the frontend may render optimistically but never permanently diverges from backend state.
- **Two fully separate frontends** — the User Website (immersive, progression-gated) and Admin Dashboard (efficient, conventional CMS) share only design tokens and generated types.
