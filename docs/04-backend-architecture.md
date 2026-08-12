# "The Journey To My Heart" — Backend & API Architecture Blueprint
### Prompt 4 Deliverable — Architecture Only, No Code / No SQL / No Routes

This document defines the backend system architecture — FastAPI application structure, API organization, security, and operational concerns — built on top of the system architecture (Prompt 1), design system (Prompt 2), and data architecture (Prompt 3). It is the binding backend reference for every future implementation prompt.

---

## Section 1 — Backend Architecture Layers

A strict layered architecture, each layer depending only on the layer(s) beneath it — never sideways, never upward.

**API Layer**
- *Purpose:* the HTTP boundary — FastAPI routers, request/response schemas (Pydantic), status codes.
- *Responsibility:* parse and validate incoming requests, invoke the Application Layer, shape outgoing responses.
- *Belongs here:* route definitions, request/response models, dependency-injection wiring (auth guards, pagination params), OpenAPI documentation metadata.
- *Never here:* business rules, direct database queries, unlock-evaluation logic, Cloudinary calls — this layer should be "dumb" translation between HTTP and application intent.

**Application Layer**
- *Purpose:* orchestrates a use case (e.g., "admin publishes a Memory," "visitor completes a game level") by coordinating one or more services.
- *Responsibility:* sequence multi-step operations, enforce use-case-level authorization checks, translate domain outcomes into API-friendly results.
- *Belongs here:* use-case/orchestration functions, transaction boundaries (an operation either fully succeeds or fully rolls back), cross-service coordination (e.g., "game completed" triggers both GameProgress update *and* UnlockCondition evaluation).
- *Never here:* raw SQL/ORM queries, HTTP-specific concerns (status codes, headers), Cloudinary SDK calls directly.

**Service Layer**
- *Purpose:* domain-specific business logic scoped to one module (Media service, Unlock service, Game service, etc.).
- *Responsibility:* implement the actual rules — how an UnlockCondition is evaluated, how a game score determines completion, how a MediaAsset replacement is processed.
- *Belongs here:* business rule implementations, validation beyond basic schema shape (e.g., "a GameLevel can't be marked complete without a prior attempt record"), calls to the Data Access Layer.
- *Never here:* HTTP request/response objects, router-level auth token parsing (services trust that authorization was already checked by the Application Layer/API dependency).

**Domain Layer**
- *Purpose:* the conceptual core — entities, value objects, and domain rules independent of any framework (this is the layer where Prompt 3's data model "means something," not just stores data).
- *Responsibility:* express domain invariants (e.g., "an UnlockCondition of composite-AND type is satisfied only when every sub-condition is satisfied") as pure logic, testable without a database or HTTP context.
- *Belongs here:* domain models/enums (ContentStatus transitions, UnlockCondition evaluation rules as pure functions), domain-level validation.
- *Never here:* database session objects, FastAPI dependencies, Cloudinary/JWT libraries — domain logic must not know these exist.

**Data Access Layer**
- *Purpose:* the only layer permitted to speak SQLAlchemy/database queries — repositories per domain (PhotoRepository, GameRepository, UnlockConditionRepository, etc.).
- *Responsibility:* translate service-layer intent ("get all published Memories for this VisitorSession's unlock state") into actual queries; return domain objects, not raw rows.
- *Belongs here:* repository implementations, query construction, database session handling.
- *Never here:* business rules (a repository fetches/persists; it doesn't decide *whether* something should be fetched based on business logic — that's the Service Layer's job).

**Infrastructure Layer**
- *Purpose:* external system integrations and cross-cutting technical concerns.
- *Responsibility:* Cloudinary SDK wrapper, JWT encode/decode utilities, background task scheduling, email/notification providers (if ever added), logging/observability setup.
- *Belongs here:* third-party SDK adapters, config/secrets loading, infrastructure clients.
- *Never here:* business logic — infrastructure code should be swappable (e.g., replacing Cloudinary with another provider) without touching Service/Domain layers, because those layers depend on an *interface*, not the concrete implementation.

**Dependency direction (strict):** API → Application → Service → Domain, with Data Access and Infrastructure invoked *from* the Service layer (behind interfaces) — never does a lower layer call upward into a higher one.

---

## Section 2 — Module Architecture

Each module maps to a domain folder from Prompt 1's backend folder structure (`services/api/app/domains/*`), following the layered pattern above internally.

| Module | Purpose | Key Responsibilities | Dependencies | Future Expansion |
|---|---|---|---|---|
| **Authentication** | Admin identity and session control | Login, token issuance/refresh/revocation, password verification | Users module | Multi-factor auth, SSO if ever needed |
| **Users** | Admin account and role management | AdminUser CRUD, Role/Permission assignment | Authentication | Multiple admins, invite flow |
| **Media** | Central media abstraction | MediaAsset CRUD, Cloudinary upload orchestration, replacement/versioning | Infrastructure (Cloudinary) | Video transcoding pipelines, AI tagging |
| **Gallery** | Photo/Album presentation logic | Album/AlbumItem CRUD, ordering, featured selection | Media | Smart/auto-generated albums |
| **Memories** | Narrative memory content | Memory/MemoryCategory CRUD, display priority | Media, Unlock Engine | Memory "collections," relationship-timeline analytics |
| **Timeline** | Chronological presentation of Memories | Timeline-specific ordering/query logic over Memory data | Memories | Branching/parallel timelines |
| **Letters** | Love letters and secret messages | Letter/SecretMessage CRUD, password verification for gated letters | Media, Unlock Engine | Scheduled letter series (e.g., "one per week") |
| **Games** | Universal mini-game backend | Game/GameLevel catalog, GameProgress tracking, score submission validation | Unlock Engine, Achievements | New game types registered purely via data |
| **Achievements** | Achievement tracking and rewards | AchievementDefinition CRUD, AchievementProgress calculation | Games, Memories, Unlock Engine | Leaderboard-style comparisons (if multi-visitor) |
| **Journey** | Narrative sequencing | JourneyStage CRUD, JourneyProgressLog, stage-entry evaluation | Unlock Engine, Visitor Progress | Branching journey paths, multiple journey "editions" |
| **Unlock Engine** | Centralized gating rules | UnlockCondition CRUD and evaluation (the pivot module referenced by nearly everything) | Visitor Progress, Games, Achievements, Journey | Composite/nested condition trees, admin rule-builder support |
| **Visitor Progress** | Visitor session and continuity | VisitorSession lifecycle, SessionRecoveryToken, UnlockedItem tracking | Unlock Engine | Multi-visitor households, "shared journey" state |
| **Analytics** | Engagement tracking | AnalyticsEvent ingestion, aggregate queries | Visitor Progress | Dashboards, funnel/drop-off analysis |
| **Settings** | Global configuration | Site-wide settings (visitor password, feature toggles) | — (largely standalone) | Per-environment config profiles |
| **Theme** | Visual identity data | Theme/Background/AnimationSetting CRUD | Media | Scheduled theme rotation |
| **Audio** | Sound content management | MusicTrack/AmbientSound/SoundEffect CRUD, trigger-key mapping | Media | Dynamic adaptive music layering |

**Cross-cutting note:** the **Unlock Engine** and **Visitor Progress** modules are structurally central — nearly every other module either *feeds* the Unlock Engine (Games, Achievements, Journey provide triggers) or is *gated by* it (Memories, Letters, Journey stages are targets). This mirrors Prompt 3's data model, where UnlockCondition was identified as the pivot entity.

---

## Section 3 — API Design Organization

Conceptual API groups, not literal routes.

| API Group | Consumed By | Responsibility | Security Requirement |
|---|---|---|---|
| **Authentication APIs** | Admin Dashboard only | Login, token refresh, logout/session revocation | Public (login itself) but rate-limited; all other calls require valid credentials |
| **Admin Content APIs** | Admin Dashboard only | Full CRUD across Media, Gallery, Memories, Letters, Games, Achievements, Journey, Theme, Audio, Settings | JWT-authenticated, Role/Permission-checked per operation |
| **Public Experience APIs** | User Website | Read-only delivery of *published, unlock-satisfied* content scoped to the requesting VisitorSession | Visitor-session-scoped (session token), site-wide password gate honored, no admin capability exposed |
| **Progress APIs** | User Website | Create/update VisitorSession, record UnlockedItem, JourneyProgressLog, session recovery | Visitor-session-scoped, rate-limited to prevent abuse |
| **Game APIs** | User Website | Fetch Game/GameLevel catalog, submit attempt/score, retrieve GameProgress | Visitor-session-scoped; score submissions validated server-side (Section 10) |
| **Media APIs** | Both (upload = Admin only; delivery = both, via Media module abstraction) | Issue signed upload URLs (admin), resolve MediaAsset → deliverable Cloudinary reference (both) | Upload endpoints JWT-protected; delivery endpoints scoped to published/unlocked content only |
| **Analytics APIs** | Admin Dashboard only | Ingest AnalyticsEvent (from User Website, write-only, no read) and serve aggregate views (to Admin, read-only) | Ingestion is visitor-session-scoped and unauthenticated-but-rate-limited (no sensitive data exposed by writing an event); read/aggregate endpoints are JWT-protected admin-only |

**Design principle:** Public Experience APIs and Admin Content APIs are **fully separated groups**, even where they touch the same underlying entities (e.g., Memory) — the public read path always applies unlock/publish filtering, while the admin path never does. Conflating these into one "flexible" endpoint set would be the most likely source of accidental content leaks (showing draft or locked content to a visitor), so the separation is a deliberate security boundary, not just an organizational preference.

---

## Section 4 — Authentication Architecture

**Admin login flow (conceptual):** admin submits credentials → Authentication module verifies against stored (hashed) password → on success, issues a short-lived **access token** and a longer-lived **refresh token** → access token is used for subsequent requests; refresh token allows obtaining a new access token without re-entering credentials.

**JWT lifecycle:**
- **Access token:** short expiry (minutes-to-low-hours range), carries admin identity and role claims, sent with every authenticated request.
- **Refresh token:** longer expiry (days), stored more carefully (e.g., httpOnly cookie rather than accessible JS storage, at implementation time), used solely to mint new access tokens.
- **Rotation:** each refresh exchange ideally issues a new refresh token and invalidates the old one (rotation), so a leaked-but-unused refresh token has a limited window of validity.

**Token handling:** access tokens are stateless (verified via signature, no DB lookup needed for normal requests); refresh tokens are tracked server-side via **AdminSession** (Prompt 3, Section 1), enabling explicit revocation ("log out everywhere") — this is why refresh state lives in the database while access tokens don't need to.

**Session management:** an AdminSession record is created at login and can be explicitly revoked (logout, or admin-initiated "revoke all sessions"); revocation is checked at refresh-time (a revoked session simply can't mint new access tokens, and the current one expires naturally shortly after).

**Password security:** passwords are never stored in plaintext or reversibly encrypted — only a strong salted hash is persisted; verification is a hash-comparison operation, never a decrypt-and-compare.

**Role handling:** the access token's claims include the admin's Role (or resolved Permission set) so the API layer can perform authorization checks without an extra database round-trip per request, refreshed whenever a new access token is issued.

**How unauthorized users are blocked:** every Admin Content API and Analytics read endpoint sits behind a dependency that requires a valid, unexpired, non-revoked access token; any request missing or failing this check is rejected before reaching the Application Layer at all — authorization failure is a Section 1 API Layer concern (fail fast, never let a request "almost" reach business logic unauthenticated).

---

## Section 5 — Authorization Model

**Roles:** at launch, effectively a single **Owner** role with full permissions (per Prompt 3's Role/Permission model) — but the enforcement mechanism (checking Permission claims, not hardcoding "is admin") is built generically from day one.

**Permissions:** atomic capability checks (e.g., `manage_media`, `manage_letters`, `publish_content`, `view_analytics`, `manage_admins`) attached to Roles — the Application Layer checks specific Permissions per use case, not a blanket "is this an admin" boolean, so future role differentiation (e.g., a "content editor" who can't touch Settings) requires no redesign.

**Resource access:** all Admin Content API operations are inherently scoped to the single project's data (there's no multi-tenant "whose content is this" concern at this stage) — resource-level authorization here is really "does this admin's Role include the Permission this operation requires," not row-level ownership checks.

**Admin-only operations:** every write operation across every content module, plus all Analytics reads, plus all Settings changes — the User Website's Public Experience/Progress/Game APIs never require admin authorization (they operate under the lighter visitor-session model instead, per Section 3).

**Future multi-user support:** because Role/Permission already exists as first-class (Prompt 3, Section 1), adding a second admin with a restricted Role (e.g., can upload photos, can't edit Letters or Settings) is a data-only change — assign a new Role with a narrower Permission set — never a schema or authorization-logic change.

---

## Section 6 — Content Delivery Architecture

**How admin creates content:** through Admin Content APIs, a content record (Memory, Letter, Album, etc.) is created with `ContentStatus = Draft` by default (Prompt 3, Section 11) — visible only to the admin, via the same Admin Content API's read/preview capability.

**How content is stored:** persisted in PostgreSQL via the Data Access Layer, with any associated binary media referenced through MediaAsset (never inline) — text content, ordering, tags, and unlock-condition references all live as structured data, exactly per Prompt 3's model.

**How content becomes published:** the admin explicitly transitions `ContentStatus` from Draft → Published (immediately) or Draft → Scheduled (with a future publish timestamp, resolved by a background process — Section 13) — this transition is itself an Application Layer use case (`publish_content`), not a raw field update, so it can enforce invariants (e.g., "a Letter can't be published without an UnlockCondition assigned, even if that condition is 'immediate'").

**How the user receives content:** the Public Experience API queries only `Published` content, **and** cross-references the requesting VisitorSession's unlock state via the Unlock Engine (Section 8) before including a given item in the response — content must pass *both* filters (published AND unlocked) to ever reach the frontend; failing either filter means the item simply doesn't appear in the response (not a 403 error — undiscovered/locked content should be invisible, not flagged as forbidden, to preserve the sense of mystery).

**Draft / Published / Archived flow:** Draft (admin-only) → Published (live, still subject to per-visitor unlock gating) → Archived (removed from active Public Experience queries entirely, but retained per Prompt 3 Section 15's versioning approach) — Archived is a deliberate, explicit admin action, never an automatic side effect of another operation.

---

## Section 7 — Media Processing Architecture

**Upload flow (conceptual):** Admin Dashboard requests a signed, time-limited upload authorization from the Media module (Infrastructure Layer talks to Cloudinary to generate this) → the browser uploads the binary directly to Cloudinary using that signed authorization (the FastAPI backend never proxies the raw file bytes, keeping the API layer lightweight per Prompt 1) → Cloudinary confirms upload completion → the Media module creates the corresponding **MediaAsset** record referencing Cloudinary's returned identifier plus admin-supplied metadata (alt text, tags).

**Cloudinary interaction:** confined entirely to the Infrastructure Layer, accessed through a Media-service interface — no other module ever calls Cloudinary directly; every other module works only with MediaAsset records.

**MediaAsset relationship:** exactly as established in Prompt 3 — content entities (Memory, Letter, Album) hold a reference to MediaAsset, never a raw Cloudinary URL; the Media module is solely responsible for resolving a MediaAsset reference into an actual deliverable URL at read-time (allowing delivery strategy — signed URLs, transformation parameters — to change without touching any content entity).

**Replacement strategy:** replacing a photo creates a **new** MediaAsset record (new Cloudinary upload) and the Application Layer repoints the referencing content entity's active reference to it; the prior MediaAsset transitions to an archived state rather than being deleted (Prompt 3, Section 15) — this is an Application Layer orchestration (touches both Media and the referencing module), not a Media-module-only operation.

**Deletion strategy:** default is soft-delete (MediaAsset marked archived/inactive, Cloudinary asset optionally retained or scheduled for later hard-deletion via a background cleanup job — Section 13) — true permanent deletion is a deliberate, separate, harder-to-trigger admin action, protecting against accidental loss of irreplaceable personal photos.

**Optimization strategy:** all delivery-time transformations (resizing, format conversion, quality adjustment for different breakpoints per Prompt 1/2's responsive and performance strategies) are handled via Cloudinary's transformation capabilities, resolved dynamically by the Media module based on requested context (thumbnail vs. full-view vs. lightbox) — the backend never stores multiple pre-rendered copies of the same image itself.

---

## Section 8 — Unlock Engine Architecture

The single most structurally important module, per Prompt 3's identification of UnlockCondition as the data model's pivot entity.

**How UnlockCondition works (conceptual evaluation model):** every gated piece of content (Memory, Letter, JourneyStage, SecretMessage) references one UnlockCondition. The Unlock Engine's job, given a VisitorSession, is to answer: **"is this condition currently satisfied for this visitor?"** — a pure evaluation function that reads the visitor's current state (GameProgress, AchievementProgress, JourneyProgressLog, current time) and the condition's configuration, returning satisfied/not-satisfied.

**Supported condition types and how each is evaluated:**
- **Time-based:** compare current server time against a stored target date-time (or a duration-since-VisitorSession-start) — satisfied once that threshold passes.
- **Game-completion:** check whether a GameProgress record exists for the referenced Game/GameLevel with status = completed for this VisitorSession.
- **Achievement-based:** check whether an AchievementProgress record for the referenced AchievementDefinition has `earned = true` for this VisitorSession.
- **Password-based:** not evaluated proactively — this condition type is satisfied only in response to an explicit visitor-submitted passphrase, verified against the stored (hashed) value at request time.
- **Prior-stage-completed:** check JourneyProgressLog for a completion record of the referenced JourneyStage.

**Multiple condition combination (AND / OR):** a condition can be **composite**, referencing multiple sub-conditions with a combinator (AND requires all sub-conditions satisfied; OR requires at least one) — evaluation recurses: a composite condition's satisfaction is computed by evaluating each sub-condition and applying the combinator, allowing arbitrarily nested rules (e.g., "(Game A completed OR Game B completed) AND Achievement X earned") without new condition types being invented per combination.

**Progress-based unlocking:** for conditions tied to *partial* progress rather than binary completion (e.g., "unlocks after viewing 5 memories"), the Unlock Engine reads the relevant AchievementProgress-style counter (Prompt 3, Section 7's incremental tracking pattern) and compares against the condition's stored target value — this reuses the same progress-tracking mechanism as achievements rather than inventing a separate counting system.

**Evaluation flow (end to end):**
1. A **trigger event** occurs (game completed, time passes, visitor submits a password, achievement earned) — captured either by an explicit Application Layer call (e.g., "game completion" use case calls the Unlock Engine after updating GameProgress) or by a scheduled re-check (Section 13, for time-based conditions with no natural trigger event).
2. The Unlock Engine identifies all UnlockCondition records potentially affected by this trigger type.
3. Each affected condition is (re-)evaluated for the relevant VisitorSession.
4. Newly-satisfied conditions result in a new **UnlockedItem** record being created for that VisitorSession (Prompt 3, Section 2) — this is the durable, queryable record of "this visitor now has access to X."
5. The Public Experience API, on any subsequent read, simply checks UnlockedItem existence (a fast lookup) rather than re-running full condition evaluation on every content read — **evaluation happens at trigger-time, consumption checks a precomputed result** — this keeps read-path performance high even as condition complexity grows.

---

## Section 9 — Visitor Journey Architecture

**Visitor identification:** no traditional account — on first visit, the Progress API issues an opaque VisitorSession token, stored client-side (per Prompt 1's approach) and sent with every subsequent Progress/Game/Public Experience API call to scope reads/writes to that visitor.

**Session handling:** the backend treats VisitorSession as the scoping key for every piece of progress data (GameProgress, UnlockedItem, AchievementProgress, JourneyProgressLog) — every relevant table/entity carries a VisitorSession reference, and every Public/Progress/Game API call is implicitly filtered by it.

**Progress saving:** every meaningful visitor action (game attempt, memory opened, stage entered) triggers a corresponding write (GameProgress update, AnalyticsEvent, JourneyProgressLog entry) — progress is saved continuously as the visitor moves through the experience, not batched/deferred, so an unexpected tab close loses nothing.

**Resume experience:** on return, the frontend presents the previously stored VisitorSession token; the backend resolves current JourneyProgressLog/UnlockedItem state and the Public Experience API naturally returns "where they left off" content — no special "resume" endpoint is strictly required, since normal state-scoped reads already reflect accumulated progress.

**Device switching:** handled via SessionRecoveryToken (Prompt 3, Section 2) — a dedicated Progress API operation lets the visitor generate a recovery code on their original device, then redeem it on a new device to reattach that device's local session reference to the same backend VisitorSession record — this is a narrow, purpose-built flow rather than a general authentication system.

**Journey state:** the "current state" of a visitor's journey is not a single field but a **derived view** — computed on demand from JourneyProgressLog (furthest stage reached) plus UnlockedItem (everything currently visible) — avoiding a fragile single "current stage" pointer that could drift out of sync with the more granular unlock records.

---

## Section 10 — Game Backend Architecture

**Backend-handled:**
- Game/GameLevel catalog delivery (what games exist, what levels, their configuration).
- **Score/completion validation** — the backend must never blindly trust a frontend-submitted "you win" flag; at minimum, plausibility checks (e.g., a submitted score/time within a sane range for that GameLevel's configuration) should be applied, since this determines real unlocks (Section 8) and achievements.
- GameProgress persistence — attempts, best score, completion status, timestamps.
- Triggering Unlock Engine evaluation upon completion (Section 8, step 1).
- Triggering Achievement progress updates upon relevant events (Section 11).

**Frontend-handled:**
- Actual gameplay logic, rendering, input handling, animations (per Prompt 1's `GameShell` architecture) — the backend has no concept of "how Memory Match's matching logic works," only "did this GameLevel get completed, with what score."
- Real-time interaction feedback (Section 7 of the Design System — hover, click, particle effects) — purely client-side, no backend round-trip needed for moment-to-moment play.

**Boundary principle:** the backend is the **source of truth for progress and rewards**, the frontend is the **source of truth for gameplay experience** — this split is what allows Prompt 1's "add an 11th game via data" scalability claim to hold: a new game only needs its Game/GameLevel catalog data and a frontend implementation of the `GameShell` contract; the backend's GameProgress/Unlock/Achievement plumbing needs no game-specific code at all.

---

## Section 11 — Achievement Architecture

**Achievement calculation:** most achievements are **event-driven** — relevant Application Layer use cases (game completed, memory viewed, letter opened) notify the Achievements module of the event; the module checks which AchievementDefinitions have criteria relevant to that event type and re-evaluates AchievementProgress for the affected VisitorSession.

**Progress tracking:** for incremental achievements ("view 10 memories"), AchievementProgress's current-value counter is incremented on each relevant event rather than recalculated from scratch each time (efficient, and naturally durable/resumable).

**Reward assignment:** when an AchievementProgress's current value reaches its target, `earned` is set true, an earned-timestamp recorded, and — critically — this event itself becomes a **trigger** the Unlock Engine listens for (Section 8), so "earning an achievement" can gate further content exactly like a game completion can, without special-casing.

**Unlock triggers:** identical mechanism to Section 8's evaluation flow — achievement-earned is simply one of the trigger types the Unlock Engine recognizes, keeping the achievement system a *producer* of unlock triggers rather than a parallel gating system.

---

## Section 12 — Analytics Architecture

**Tracking approach:** lightweight, append-only AnalyticsEvent ingestion (Prompt 3, Section 13) via a dedicated write-optimized endpoint group — the frontend fires events for the listed categories (visits/scene entries, memory views, game attempts, completions, time-on-scene, achievements earned) as they naturally occur during the experience.

**Errors:** client-side errors (e.g., a game failing to load, a media asset failing to fetch) are also captured as a distinct AnalyticsEvent type — giving the admin visibility into technical friction the visitor experienced, not just their emotional/content engagement.

**Aggregation:** raw AnalyticsEvent rows are the durable source of truth; aggregate views (completion rates, most-viewed memories, average time per stage) are computed on read (or via a periodic background aggregation job, Section 13, if volume ever warrants precomputed rollups) — never double-counted or independently maintained as a second mutable source of truth.

**Consumption:** exclusively through admin-only, JWT-protected Analytics read endpoints (Section 3) — the ingestion path is one-directional and write-only from the frontend's perspective; visitors never receive analytics data back.

---

## Section 13 — Background Processing

Tasks suited to asynchronous/background execution rather than synchronous request handling:

- **Media processing** — any post-upload processing Cloudinary doesn't handle synchronously (e.g., triggering additional derived-format generation), handled asynchronously so uploads don't block the admin's UI.
- **Analytics aggregation** — periodic rollup of raw AnalyticsEvent data into precomputed summaries, if/when raw-event query performance warrants it (an optimization, not a day-one requirement).
- **Scheduled unlock checks** — time-based UnlockConditions (Section 8) have no natural "trigger event" the way a game completion does; a periodic background job re-evaluates due-to-become-satisfied time-based conditions across active VisitorSessions (e.g., checking every few minutes, or precisely scheduling the specific "unlocks at midnight" moment) rather than requiring every content read to re-check the clock.
- **Scheduled content publishing** — resolves Draft-with-future-date (Scheduled status, Prompt 3 Section 11) content into Published state once its publish timestamp arrives.
- **Notifications** — not core to the initial scope (this is a two-person gift experience, not a multi-user platform with alerting needs), but architected as a future-possible background task category (e.g., "notify admin when the visitor reaches the Final Surprise") rather than excluded outright.
- **Cleanup jobs** — periodic purging of expired SessionRecoveryTokens, stale AdminSessions past their revocation/expiry, and (carefully, deliberately) any MediaAssets explicitly marked for hard-deletion after their retention grace period.

---

## Section 14 — Error Handling Strategy

- **Validation failures:** caught at the API Layer via Pydantic schema validation before reaching Application logic — returns a clear, structured error response describing which field(s) failed and why, never a raw stack trace.
- **Authentication errors:** distinguished clearly between "not authenticated at all" (missing/invalid token) and "authenticated but not authorized" (valid admin, insufficient Permission) — both fail fast at the API Layer boundary (Section 4/5), never partially executing business logic first.
- **Missing content:** Public Experience API requests for content that doesn't exist, isn't published, or isn't unlocked for the requesting VisitorSession should behave **identically** (a generic "not found," never distinguishing "exists but locked" from "doesn't exist") — this is a deliberate security/experience choice, preventing the API from leaking the existence of not-yet-unlocked content.
- **Game failures:** implausible/invalid score submissions (Section 10) are rejected with a clear validation error rather than silently accepted — but a *visitor's in-game loss/failure state* is not a backend "error" at all, simply a valid GameProgress outcome (status remains "in progress" or a non-completed state).
- **Media failures:** upload failures (Cloudinary-side) surface a clear, actionable error to the Admin Dashboard (distinguishing, where possible, "file too large," "unsupported format," "network/service failure") rather than a generic failure message.
- **System failures:** unexpected/unhandled exceptions are caught at a top-level handler, logged with full internal detail server-side, but return a generic, non-revealing error to the client (never expose internal stack traces, query details, or infrastructure information to either Admin or Visitor-facing responses).

---

## Section 15 — Security Architecture

- **Authentication:** covered fully in Section 4 — hashed passwords, short-lived access tokens, revocable refresh sessions.
- **Authorization:** covered fully in Section 5 — Role/Permission-gated admin operations, visitor-session-scoped (non-privileged) public access.
- **Sensitive photos/private letters:** delivered only via unlock-and-publish-filtered Public Experience API responses (Section 6), with Cloudinary delivery URLs generated per-request rather than permanently embedded/cached where feasible (Prompt 3, Section 16).
- **Password protection:** both the site-wide visitor password and per-Letter passwords (Prompt 3, Section 5/16) are verified server-side against hashed values — never compared client-side, never transmitted or logged in plaintext.
- **Rate limiting:** applied to authentication endpoints (prevent credential brute-forcing), password-verification endpoints (site-wide and per-letter), and analytics ingestion (prevent abuse/flooding) — public read endpoints are also reasonably rate-limited to prevent scraping/enumeration attempts against locked content.
- **Input validation:** every API Layer entry point validates shape and constraints via Pydantic before any Application/Service logic runs — defense against malformed or malicious payloads starts at the boundary, not deep in business logic.
- **Secrets management:** Cloudinary credentials, JWT signing keys, database credentials are never hardcoded or committed — sourced from environment configuration (Infrastructure Layer), with the API/Application/Service/Domain layers never directly handling raw secret values (they go through the Infrastructure Layer's abstractions).

---

## Section 16 — Performance Architecture

- **Caching:** Public Experience API responses for content that rarely changes mid-session (Theme, published Memory/Letter catalog structure) are strong caching candidates (short-to-medium TTL, invalidated on admin publish actions) — VisitorSession-specific data (progress, unlock state) is not cached the same way, since it must always reflect the latest state.
- **Database optimization:** indexing aligned to the model's real access patterns from Prompt 3 (VisitorSession-scoped lookups across GameProgress/UnlockedItem/AnalyticsEvent are the highest-frequency query shape and should be indexed accordingly); the Unlock Engine's "check UnlockedItem existence" read path (Section 8, step 5) is specifically optimized since it's on the critical path of nearly every Public Experience API call.
- **Media optimization:** entirely delegated to Cloudinary's transformation/delivery pipeline (Section 7) — the backend never re-implements image processing.
- **Lazy loading support:** Public Experience APIs support pagination/partial responses (e.g., "give me the next batch of Gallery items," "give me this JourneyStage's content, not the entire experience at once") so the frontend's route-based code-splitting and predictive preloading strategy (Prompt 1, Section 14) has matching backend support rather than forcing large upfront payloads.
- **API response optimization:** response schemas return only what a given API group's consumer needs (Public Experience responses never include admin-only fields like internal notes or draft content, even filtered — they're excluded from the schema entirely, not just hidden by the frontend).

---

## Section 17 — Scalability Architecture

- **Multiple experiences:** because Theme, JourneyStage, and content entities are already fully data-driven per-project rather than hardcoded, the architecture *could* extend to support multiple distinct "experiences" (e.g., separate journey configurations) by adding a lightweight experience/project-scoping identifier across the data model — a plausible future extension, not required at current scope.
- **Multiple users (visitors):** VisitorSession is already inherently multi-instance (Section 9) — nothing architecturally assumes a single visitor; supporting several simultaneous visitors (e.g., family members exploring independently) requires no redesign.
- **More games:** covered structurally in Section 10 — new games are data (Game/GameLevel catalog entries), not new backend code paths.
- **More content:** the layered module architecture (Section 2) and pagination-aware API design (Section 16) scale to significantly larger content volumes without structural change — growth here is a data/indexing concern, not an architecture concern.
- **Additional admins:** Role/Permission (Section 5) already supports this without schema change — onboarding a second admin is a data operation (create AdminUser, assign Role), not a backend redesign.
- **Path to service extraction:** the strict layering (Section 1) and module boundaries (Section 2) mean that if any single module (most plausibly Media, given binary-adjacent processing needs) ever warranted extraction into its own deployable service, the Service Layer's interface-based design minimizes the blast radius of that change — this remains a modular monolith by choice, with a deliberate escape hatch, not a premature microservice split.

---

## Section 18 — Final Backend Blueprint Summary

**Backend architecture diagram description:** the FastAPI application is organized as a **modular monolith**, layered strictly (API → Application → Service → Domain, with Data Access and Infrastructure reached from the Service layer), and internally divided into 16 domain modules (Section 2) mirroring the data architecture's entity clusters. Two frontends (Admin Dashboard, User Website) consume the same backend through **cleanly separated API groups** (Section 3) — an authenticated, full-CRUD Admin surface and a lightweight, visitor-session-scoped, read-mostly Public/Progress/Game surface — never sharing endpoints, even where they touch the same underlying content.

**Module relationship summary:** the **Unlock Engine** and **Visitor Progress** modules sit structurally central, consumed by (and feeding into) nearly every content and gamification module (Games, Achievements, Journey, Memories, Letters) — mirroring the data model's UnlockCondition-as-pivot design from Prompt 3. The **Media** module is the sole gateway to Cloudinary, consumed by every content module that displays imagery/audio/video, but never bypassed.

**API responsibility summary:** Authentication and Admin Content APIs are exclusively for the Admin Dashboard, fully JWT/Role/Permission-gated; Public Experience, Progress, and Game APIs are exclusively for the User Website, scoped by VisitorSession rather than admin credentials, and always filtered through the Published + Unlocked double-gate (Section 6) before any content is returned; Analytics APIs are asymmetric — open, rate-limited ingestion from the User Website, fully gated aggregate reads for the Admin Dashboard.

**Data flow:**

```
Admin (Dashboard)
   ↓  [Admin Content APIs — authenticated, full CRUD]
Backend (Application → Service → Domain layers apply business rules,
          Unlock Engine + Content Status govern what becomes visible)
   ↓  [Data Access Layer]
Database (PostgreSQL — Prompt 3's full data model; MediaAsset
          abstracts Cloudinary; UnlockCondition governs gating)
   ↓  [Public Experience / Progress / Game APIs — visitor-session-scoped,
       Published + Unlocked filtering applied on every read]
User Experience (User Website — renders exactly what the visitor
                  has earned access to, through Prompt 2's design system)
```

**How all previous design decisions are preserved:** Prompt 1's layered/modular architecture is realized concretely in Sections 1–2; Prompt 2's content-driven, no-hardcoded-content principle is enforced structurally by Section 6's Draft/Published/Archived flow and Section 3's strict API separation; Prompt 3's entire data model — especially UnlockCondition as the central pivot and MediaAsset as the Cloudinary indirection layer — is the direct backbone of Sections 7 and 8 here, with no reinterpretation or drift. Every backend decision in this document exists to serve content that the admin fully controls and a visitor experience that only ever reveals what has been earned.

---

**Waiting for Prompt 5.**
