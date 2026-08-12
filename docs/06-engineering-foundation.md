# "The Journey To My Heart" — Engineering Foundation & Development Workflow
### Prompt 6 Deliverable — Process & Workflow Architecture Only, No Code / No Config / No Commands

This document defines how the project will actually be built, day to day — repository shape, environments, standards, workflow, testing, and operations — built on top of Prompts 1–5. It is the binding engineering process reference for every future implementation prompt.

---

## Section 1 — Repository Architecture

**Chosen approach: Monorepo.**

**Why this fits this project:** the two frontends and one backend share a single, evolving architectural contract (design tokens, API schema, data model) across an anticipated 20–30 implementation prompts. A monorepo keeps architecture, code, and documentation moving together in lockstep — a backend schema change and the frontend types that depend on it land in the same review, not coordinated across repositories. Given this is a tightly-coupled, single-team (effectively single-contributor) project rather than independently-releasing services owned by different teams, the coordination cost of separate repositories would outweigh any isolation benefit.

**Structure (conceptual, mirroring Prompt 1's folder layout):**
- **Frontend location:** `apps/web` (User Website) and `apps/admin` (Admin Dashboard) — two independent, independently-buildable applications within the monorepo.
- **Backend location:** `services/api` — the FastAPI application.
- **Documentation location:** a root-level `docs/` directory housing this entire prompt series (architecture, design system, data model, backend/frontend blueprints, this engineering foundation, and everything that follows) as the project's living reference — every future prompt's output is filed here, not scattered across ad hoc notes.
- **Infrastructure location:** `infra/` — deployment configuration, environment templates, CI/CD definitions (Section 15), kept separate from application code so operational concerns don't entangle with feature code.
- **Shared resources:** `packages/` — the design-token/UI-kit package and any generated shared types (Prompt 1, Section 3), consumed by both frontend apps without duplication.

**Boundary discipline:** despite living in one repository, `apps/web`, `apps/admin`, and `services/api` remain **independently deployable units** — the monorepo is an organizational and coordination choice, not an invitation to blur the strict separation established in Prompts 1, 4, and 5 (no importing backend code into frontend apps, no admin-app code imported into the user-website app, etc.).

---

## Section 2 — Development Environments

| Environment | Purpose | Characteristics |
|---|---|---|
| **Local development** | Day-to-day implementation and iteration | Runs against a local/isolated database instance, uses development-tier Cloudinary resources (or a clearly separated folder/preset within Cloudinary), permissive logging/debugging enabled, hot-reload on both frontends and backend |
| **Testing** | Validating a feature/prompt's output before it's considered "done," and running automated test suites (Section 9) | Mirrors production configuration shape as closely as practical, but with isolated data (never real personal photos/letters used for automated test fixtures — synthetic/placeholder content only), used for both automated CI runs and manual pre-merge review |
| **Production** | The actual live gift experience | Real content, real media, tightened logging (no verbose debug output), real domain/SSL (Section 15), backups active (Section 16), and the only environment where the real Cloudinary account and real database are used |

**Key differences:** local and testing environments must **never** contain real personal content (the couple's actual photos, letters, private stories) — this is both a security discipline (Prompt 4, Section 15) and a practical one (synthetic content lets automated tests be deterministic and shareable without exposing anything private). Production is the only environment where real secrets (Section 3) and real personal data coexist.

---

## Section 3 — Configuration Strategy

**Environment variables:** all environment-specific values (API base URLs, database connection details, feature flags) are sourced from environment configuration, never hardcoded into application code — each environment (Section 2) has its own configuration set, loaded at runtime/build-time rather than baked into the codebase.

**Secrets:** Cloudinary credentials, JWT signing keys, database credentials, and any future third-party API keys are treated as secrets — distinct from ordinary environment variables in that they carry direct security risk if exposed. They're managed through the hosting platform's secret-management facilities (Section 15) rather than plain environment files wherever the platform supports it.

**API URLs:** each frontend app's target backend URL is itself an environment-specific configuration value — local development points at a local backend, testing points at a testing-tier backend, production points at the production backend — never hardcoded per-environment logic branching inside application code.

**Database configuration:** connection details (host, credentials, database name) are entirely environment-driven; the application code has no awareness of *which* environment's database it's talking to beyond what configuration tells it.

**Cloudinary credentials:** treated as secrets (above); additionally, using **separate Cloudinary folder namespaces or presets per environment** (Section 2) prevents local/testing uploads from ever mixing with production media, even under a shared account.

**Authentication secrets:** JWT signing keys are environment-specific (a testing-environment key must never be reused in production) and rotated capability (Prompt 4, Section 4's revocation model) is a config-level concern, not something requiring code changes to support.

**What must never be stored in source control:** any actual secret value (real credentials, real signing keys, real API tokens), any real personal content used as test fixtures, and any environment-specific configuration file containing populated real values — only **templates/examples** documenting *which* configuration values exist (with placeholder content) belong in the repository; actual values live exclusively in each environment's secret/config store.

---

## Section 4 — Coding Standards

**Naming conventions:** consistent, descriptive naming aligned to each language's idiomatic convention (e.g., the casing style idiomatic to TypeScript/React on the frontend, idiomatic to Python on the backend) — names describe *intent* (`unlockConditionEvaluator`, not `helper2`), and domain terms established in Prompts 1–5 (Memory, UnlockCondition, JourneyStage, GameShell) are used consistently and identically across frontend, backend, and documentation — never renamed/reinterpreted ad hoc in a later prompt.

**Folder naming:** mirrors the structures already defined in Prompt 1 (backend domains), Prompt 5 (frontend features) — lowercase, hyphenated or snake_case per each stack's convention, one folder per feature/domain/module, never a generic catch-all "misc" or "utils-2" folder.

**File organization:** one primary concern per file (a component, a service, a repository) — files are named for what they contain, and co-located with their feature per the vertical-slice principle (Prompt 1, Section 3) rather than grouped purely by technical type.

**Comments:** reserved for *why*, not *what* — code should be readable enough that a comment explaining "what this line does" indicates the code itself should be clearer; comments are appropriate for non-obvious business rules (e.g., "composite AND/OR evaluation order matters here because...") or intentional deviations from an otherwise-expected pattern.

**Documentation:** every module/feature carries a brief purpose statement (mirroring the "Purpose" framing used throughout Prompts 3 and 4) at its entry point, so a future prompt's implementer (human or AI) can understand a folder's role without reverse-engineering it from code alone.

**Code readability:** favor clarity over cleverness — a straightforward, slightly longer implementation is preferred over a dense one-liner that requires unpacking; this matters especially given the project spans dozens of prompts, likely with gaps between sessions, where re-orientation cost is real.

**Reusable patterns:** once a pattern is established (the List→Editor→Preview admin pattern, the `GameShell` contract, the motion-primitive layer), future implementation must **reuse it explicitly**, not reinvent a parallel version — deviation from an established pattern is a decision that should be visible and justified, not accidental drift.

---

## Section 5 — Frontend Development Rules

Directly extending Prompt 5:

- **Component creation rules:** every new component is placed at the correct layer (Prompt 5, Section 4 — UI/Memory/Game/Admin/Animation/Experience/Global) based on its actual domain knowledge, not convenience; a component with zero domain knowledge never gets created inside a feature folder "just this once," and a feature-specific component never gets promoted to the shared UI kit just because it seems reusable in the abstract — promotion happens only once a second genuine consumer exists.
- **State management rules:** every new piece of state is classified against Prompt 5, Section 6's five-way split *before* being implemented — "where does this belong" is answered up front, not discovered by trial and error; server data is never duplicated into Zustand under any circumstance.
- **Animation rules:** any new animation is built from the existing motion-primitive layer (Prompt 5, Section 5/10) wherever a suitable primitive exists; a genuinely new primitive is added to the shared layer rather than inlined into a single component, and every new animated feature ships with its reduced-motion equivalent in the same change, never as a follow-up.
- **Asset handling rules:** no bulk media is ever committed to the repository or bundled as a local asset — everything routes through MediaAsset/Cloudinary (Prompt 5, Section 13); only genuinely static, always-needed assets (icons, fonts) may live locally.
- **Performance rules:** any new scene/game/feature is evaluated against Prompt 5, Section 16's code-splitting and asset-budget expectations before being considered complete — a feature that noticeably degrades load time or introduces an un-disposed animation loop is not "done," even if functionally correct.

---

## Section 6 — Backend Development Rules

Directly extending Prompt 4:

- **Module boundaries:** a new module's logic stays within its own domain folder (Prompt 4, Section 2); cross-module coordination happens at the Application Layer, never by one Service Layer reaching directly into another module's repository or internals.
- **Service responsibilities:** business rules live in the Service Layer, never leak into the API Layer (as inline route logic) or the Data Access Layer (as query-embedded conditionals) — if a rule is being expressed as SQL/ORM query logic beyond basic filtering, that's a signal it belongs in the Service Layer instead.
- **Validation approach:** shape/type validation happens at the API Layer via schemas (Prompt 4, Section 1/14); business-rule validation (e.g., "an UnlockCondition can't reference itself") happens in the Service/Domain layers — the two are not conflated into one validation pass.
- **Error handling rules:** every new endpoint follows Prompt 4, Section 14's categorization (validation/auth/missing-content/domain-specific/system) — errors are never allowed to bubble up as raw exceptions/stack traces to a client response.
- **Security practices:** every new Admin Content endpoint is checked against Prompt 4, Section 5's Permission model before being considered complete; every new Public Experience endpoint is checked against the Published+Unlocked double-gate (Prompt 4, Section 6) — these checks are part of a feature's definition of done, not an afterthought pass.

---

## Section 7 — Database Development Rules

**Migration philosophy:** every schema change is expressed as an explicit, incremental migration (Alembic, per Prompt 1) — never a manual/ad hoc database edit in any environment, including local development; migrations are additive and forward-moving by default, with destructive changes (dropping a column/table) treated as a deliberate, separately-considered step rather than bundled casually into an unrelated feature migration.

**Data integrity rules:** relationships defined in Prompt 3 are enforced at the database level wherever the relational model supports it (foreign key constraints reflecting the one-to-many/many-to-many relationships from Prompt 3, Section 14) — application-level checks alone are not considered sufficient for core relational integrity.

**Relationship handling:** join/junction entities identified in Prompt 3 (AlbumItem, Role↔Permission) are implemented exactly as modeled — no collapsing a many-to-many-with-attributes relationship into a bare many-to-many just for implementation convenience, since the extra attributes (ordering, captions) are load-bearing for the experience.

**Versioning approach:** the ContentRevision/soft-delete/archive pattern established in Prompt 3, Section 15 is implemented consistently across every content entity that warrants it (primarily long-form text content and MediaAsset) — this is treated as a standard pattern applied uniformly, not something bolted onto individual entities inconsistently as the need arises.

---

## Section 8 — Git Workflow

**Branch strategy:** a simple, low-ceremony trunk-based-adjacent flow appropriate to this project's scale — a stable main branch representing production-ready state, with short-lived feature branches (one per implementation prompt or logical unit of work) merged back once complete; long-lived divergent branches are avoided given the project's sequential, prompt-by-prompt build style.

**Commit standards:** commits are scoped to a single logical change and carry a clear, descriptive message stating *what* changed and, where non-obvious, *why* — commit messages reference which architectural area they touch (e.g., referencing the relevant module from Prompt 4's Section 2) so history remains traceable against this document series.

**Feature development flow:** each implementation prompt's output corresponds to one feature branch → implementation against the relevant architecture sections → self-review against this document's standards (Sections 4–7) → merge to main once the feature is functionally complete and consistent with all prior prompts' decisions.

**Review process:** even in a single-contributor context, a deliberate **self-review pass** against the standing architecture (does this match Prompt 2's design tokens, Prompt 3's data model, Prompt 4's layering, Prompt 5's component rules) is treated as a mandatory step before merging — the review checklist *is* this document series, not a separate invented rubric.

---

## Section 9 — Testing Strategy

| Area | Approach |
|---|---|
| **Frontend testing** | Component-level tests for presentation/behavior correctness (does a `MemoryCard` render given data, does a form validate input), feature-level tests for critical flows (does the World Map correctly reflect locked/unlocked state given mock progression data) |
| **Backend testing** | Unit tests at the Service/Domain layer (business rules, especially Unlock Engine evaluation logic — Prompt 4, Section 8 — given its centrality, this deserves the heaviest test coverage of any single module), integration tests at the API layer (does a request produce the expected response/side effects end to end against a test database) |
| **Database testing** | Migration tests (does a migration apply cleanly and reversibly against a representative schema state), integrity tests (do relationship constraints behave as modeled) |
| **Game testing** | Each game's internal logic (win/loss conditions, scoring) tested independently of `GameShell`; `GameShell`'s lifecycle/contract (Prompt 5, Section 11) tested once, generically, against a mock/stub game rather than re-testing shell behavior per individual game |
| **Animation testing** | Primarily manual/visual verification (animation correctness is inherently perceptual) supplemented by automated checks for the *mechanics* that can be verified programmatically — reduced-motion fallback actually engaging when the setting is active, animation cleanup/disposal actually occurring on unmount (Prompt 5, Section 16) |
| **User experience testing** | Manual, scenario-based walkthroughs of the full emotional journey (Prompt 2, Section 6's mood-curve stages) — this is the one area that resists full automation, given the product's success criteria are fundamentally emotional/experiential, not purely functional |

**Priority principle:** given limited testing effort should be spent where correctness matters most, the **Unlock Engine** (Prompt 4, Section 8) and **content Published+Unlocked filtering** (Prompt 4, Section 6) receive the most rigorous automated coverage of any backend area — a bug here either breaks the surprise (revealing something too early) or breaks the gift (a visitor unable to progress), both unacceptable failure modes for a one-shot emotional experience.

---

## Section 10 — Quality Assurance

- **Bug prevention:** primarily through the layering and standards discipline established in Sections 4–7 — a consistent architecture with clear boundaries is itself the biggest bug-prevention mechanism, supplemented by the targeted automated testing from Section 9.
- **Performance checks:** each new scene/feature is manually checked against Prompt 1/5's performance strategy (load time, animation smoothness, no unbounded memory growth) before being considered complete — informal but consistent, given the project's scale doesn't warrant a heavy automated performance-testing pipeline.
- **Security checks:** every new Admin/Public API surface is checked against Prompt 4, Section 15's checklist (auth required where appropriate, input validated, no sensitive data over-exposed in the response shape) as part of that feature's completion criteria.
- **Responsive checks:** every new scene/component is manually verified across the three device tiers (Prompt 2, Section 13 / Prompt 5, Section 14) — not just resized-desktop-browser checking, but genuine touch-interaction verification on tablet/mobile-class devices or emulation.
- **Browser testing:** verification across current major evergreen browsers (the project has no legacy-browser support requirement given its personal, one-time-audience nature) — the priority is correctness on whatever device/browser the actual gift recipient will realistically use, checked deliberately rather than assumed.

---

## Section 11 — Logging and Monitoring

- **Frontend logging:** client-side errors (failed content fetches, game/animation runtime errors) are captured and reported (Prompt 4, Section 12's error-type AnalyticsEvent) rather than only surfacing silently in the browser console — giving the admin visibility into any technical friction the actual visitor experiences.
- **Backend logging:** structured, leveled logging (info for normal operation, warning for recoverable issues, error for genuine failures) across the layered architecture (Prompt 4, Section 1) — logs never include secret values, raw passwords, or full personal content bodies (letter text, etc.), only enough context to diagnose an issue (which endpoint, which entity type, what failed).
- **Error tracking:** system-level failures (Prompt 4, Section 14) are logged with full internal detail server-side even though the client only sees a generic message — this asymmetry (detailed internally, generic externally) is the standing rule from the backend blueprint, reaffirmed here as a logging practice, not just a response-shaping rule.
- **Analytics tracking:** implemented exactly per Prompt 3/4's AnalyticsEvent model — engagement-focused, privacy-conscious, admin-facing only, never extended toward third-party tracking or ad-adjacent telemetry, consistent with the project's nature as a private gift rather than a public product.

---

## Section 12 — Media Pipeline

**Photos:** admin uploads via the signed-URL flow (Prompt 4, Section 7) directly to Cloudinary → MediaAsset record created with metadata (alt text, tags) → available for attachment to Memory/Album/Letter content — the development workflow for adding a new photo never involves a developer or a code change, only admin action, validating the content-as-data principle end to end.

**Videos:** same signed-upload path as photos, with the Media module's larger-file/longer-processing handling (Prompt 4, Section 7/13) — development-time testing of video features uses short, small placeholder video files (Section 2) rather than real, potentially large personal video content.

**Audio:** voice notes and music tracks follow the same MediaAsset pipeline; development/testing of the Audio Engine (Prompt 5, Section 13) uses placeholder audio clips, with real voice-note content only ever present in the production environment.

**Animations:** Lottie files (pre-authored vector animations, Prompt 2/5) are versioned within the frontend codebase as design assets (not user-generated content, so they don't route through Cloudinary/MediaAsset) — sourced from whatever design tooling produces them, reviewed for on-brand consistency (Prompt 2) before being integrated into the motion-primitive layer.

---

## Section 13 — Game Development Workflow

**How new games are added:** per Prompt 4, Section 10 and Prompt 5, Section 11 — (1) a Game catalog entry is created (admin-side, data-only) with a type identifier the frontend recognizes, (2) a frontend implementation of that game's `init/render/onComplete/getScore` contract is developed and registered against that type identifier, (3) GameLevel entries are authored (admin-side, data-only) with that game's specific configuration shape, (4) any GameReward/UnlockCondition wiring is configured (admin-side, data-only). Steps 1, 3, and 4 require no code; only step 2 (a genuinely new game's play logic) is a development task — everything else the game needs (progress tracking, scoring pipeline, reward presentation, achievement eligibility) is inherited for free from the shared `GameShell`/backend Games module.

**How games communicate with the Progress system:** exclusively through `GameShell`'s completion-reporting responsibility (Prompt 5, Section 11) calling the backend's game-completion endpoint (Prompt 4, Section 3/10) — an individual game module never talks to the Progress API directly.

**How games communicate with the Achievement system:** indirectly — a game's completion event (recorded via GameProgress) is one of the event types the Achievements module listens for (Prompt 4, Section 11); the game itself has no awareness that an achievement might be evaluated as a consequence of its completion.

**How games communicate with the Unlock Engine:** also indirectly — game completion is one of the Unlock Engine's recognized trigger types (Prompt 4, Section 8); a game module never checks or manipulates unlock state itself, it only ever reports "this level is complete, here's the score" and lets the backend's centralized systems handle every downstream consequence.

---

## Section 14 — Content Creation Workflow

Mirroring Prompt 4, Section 6, expressed as the admin's actual working process:

1. **Creation:** admin opens the relevant content manager (Prompt 5, Section 3), creates a new record via the Editor view — saved immediately as `Draft` (Prompt 3, Section 11), visible only within the admin's own preview.
2. **Review:** the admin uses the Editor's live-preview pane (Prompt 2, Section 15) to see exactly how the content will render in the actual User Website styling before committing to publish — this is the project's substitute for a formal multi-person review process (Prompt 3, Section 11 explicitly scoped out heavier approval workflows as unwarranted for this project's single-admin scale).
3. **Publishing:** admin transitions the record to `Published` (immediately) or `Scheduled` (future date-time, resolved by the background job from Prompt 4, Section 13) via an explicit action — never an implicit side effect of saving.
4. **User experience:** once Published *and* any associated UnlockCondition is satisfied for a given visitor, the content becomes reachable through the Public Experience API and renders through the design system (Prompt 2) — completing the full loop from admin authorship to visitor-facing magic with zero code involved anywhere in this cycle.

**Content iteration:** if the admin wants to revise already-published content, the same Editor is used; the ContentRevision pattern (Prompt 3, Section 15) preserves the prior version, and the change is live immediately (no separate "re-publish" step needed for simple edits, since Published status doesn't reset on an edit — only the underlying content changes).

---

## Section 15 — Deployment Strategy

**Frontend hosting:** both `apps/web` and `apps/admin` are static/SPA builds suited to a modern static-hosting/CDN platform (e.g., a Vercel/Netlify-class provider) — each deployed independently, consistent with Section 1's "independently deployable units" principle, each with its own environment configuration (Section 3) pointing at the appropriate backend.

**Backend hosting:** the FastAPI application deployed to a platform supporting a persistent Python process (a container-based or PaaS-style host) — chosen for straightforward horizontal scalability if ever needed (Prompt 4, Section 17) without requiring a rearchitecture at deployment time.

**Database hosting:** a managed PostgreSQL provider (rather than self-hosted) — reduces operational burden (patching, backups infrastructure) for a project without a dedicated ops function, while still providing the relational guarantees Section 7 depends on.

**Storage:** Cloudinary, exactly as established throughout Prompts 1, 3, and 4 — no change in deployment; Cloudinary is already a hosted service, only the environment-specific credentials/folder scoping (Section 3) differ between testing and production.

**Domain:** a dedicated custom domain for the User Website (befitting the "gift" framing — a memorable, personal URL rather than a generic subdomain), with the Admin Dashboard reachable via either a separate subdomain or a non-obviously-discoverable path, adding a mild additional layer of obscurity on top of its actual authentication requirement (Prompt 4, Section 4).

**SSL:** enforced everywhere (frontend, backend, database connections) — most modern hosting platforms provision this automatically for custom domains, and no environment should ever serve the experience or the API over an unencrypted connection, particularly given the personal/sensitive nature of the content (Prompt 4, Section 16).

---

## Section 16 — Backup and Recovery

**Database backups:** automated, regular backups through the managed PostgreSQL provider's native capability (Section 15) — given this database holds irreplaceable personal content (relationship history, letters, progress), backup frequency and retention should be treated as a genuinely important operational concern, not an afterthought, despite the project's small scale.

**Media backups:** Cloudinary itself provides durable storage, but given the irreplaceability of the actual photos/videos/voice notes, retaining the admin's own original source files outside the application entirely (a personal archive, independent of this system) is a sensible complementary practice — the application's backup strategy protects *metadata and structure* (which Cloudinary asset belongs to which Memory, in what order), while the underlying files benefit from the redundancy of not depending on any single system.

**Configuration backups:** environment/secret configuration (Section 3) is backed up through whatever secure mechanism the hosting/secret-management platform provides — never as a plaintext file copied outside that system, even for backup purposes.

**Recovery approach:** the soft-delete/archive/ContentRevision pattern (Section 7, Prompt 3 Section 15) is the **first line of recovery** for accidental content changes (no database restore needed for "I didn't mean to delete that photo" — it's simply un-archived); full database restore from backup is reserved for genuine data-loss scenarios beyond what the application's own versioning handles.

---

## Section 17 — Scalability Preparation

Reaffirming Prompt 4, Section 17 from an engineering-process angle:

- **More users (visitors):** already structurally supported (VisitorSession is inherently multi-instance) — no engineering process change needed, purely a matter of the existing architecture being exercised at slightly higher volume.
- **More experiences:** the monorepo/modular structure (Section 1) and fully data-driven content model (Prompts 3–4) mean a hypothetical second "experience" (a future anniversary edition, for instance) is architecturally plausible as new data within the same schema, or as a scoped extension — this document doesn't commit to building that now, only notes that nothing in the current process actively forecloses it.
- **More games:** Section 13's workflow already treats new games as a routine, well-defined addition process, not a special engineering event.
- **More content:** the content creation workflow (Section 14) scales linearly with volume — no process bottleneck is introduced by having significantly more Memories/Photos/Letters over time, since it's all admin-side data entry against an already-built system.
- **Multiple birthdays/events:** if the project ever needed to support genuinely separate, parallel journey configurations (rather than just "more content within one journey"), that would be a deliberate architectural extension (a lightweight experience-scoping identifier, as flagged in Prompt 4 Section 17) — worth a dedicated future prompt if it ever becomes a real requirement, rather than something this document over-engineers for prematurely.

---

## Section 18 — Final Engineering Foundation Summary

**Complete development workflow:** a single monorepo (Section 1) housing two independently-deployable frontends and one backend, developed through three clearly differentiated environments (Section 2) with strict secret/configuration hygiene (Section 3), governed by consistent coding standards (Section 4) and stack-specific development rules that trace directly back to Prompts 4 and 5 (Sections 5–7), built through a low-ceremony but disciplined Git workflow (Section 8), validated by testing effort deliberately weighted toward the Unlock Engine and content-gating correctness (Section 9), and shipped to production-appropriate hosting (Section 15) with genuine backup discipline (Section 16) given the irreplaceable nature of the content involved.

**Repository philosophy:** one coordinated codebase, strictly internally partitioned — coordination benefit without architectural blurring; every boundary established in Prompts 1, 4, and 5 (module boundaries, API group separation, frontend/backend independence) is preserved *inside* the monorepo, not weakened by shared proximity.

**Engineering principles:**
1. Every implementation decision must trace back to an already-established architectural decision (Prompts 1–5) — this document series is the specification, not a suggestion.
2. Content-as-data is enforced as an engineering discipline, not just a design intention — the content creation workflow (Section 14) has zero code-change steps by construction.
3. The Unlock Engine and content-gating logic receive the highest engineering rigor (testing, review, security-check priority) of any system component, because their failure modes are uniquely unacceptable for a one-shot emotional gift.
4. Nothing irreplaceable (personal photos, letters, relationship history) is treated casually — soft-delete-by-default, genuine backup discipline, and real/synthetic content separation across environments are non-negotiable.
5. Reuse established patterns explicitly; treat deviation as a decision requiring justification, not a shortcut.

**Implementation rules (standing, for every future prompt):** classify new code against the correct architectural layer before writing it; never store secrets or real personal content outside production; never bypass the Published+Unlocked gate or the centralized Unlock Engine with ad hoc gating logic; never duplicate server state into client state; never add a game, content type, or admin module without following the already-established shared pattern (`GameShell`, List→Editor→Preview, MediaAsset indirection) for that category of work.

**How future implementation prompts should follow this foundation:** every subsequent prompt (Prompt 7 onward, entering actual implementation per Prompt 1's roadmap) should be evaluated first against *which module/layer/pattern from Prompts 1–6 it belongs to*, implemented according to this document's standards, and self-reviewed (Section 8) against the full architecture series before being considered complete — this document, alongside Prompts 1–5, is the complete, standing constitution for the project; no future prompt should introduce a new structural pattern without explicitly reconciling it against what's already been defined here.

---

**Waiting for Prompt 7.**
