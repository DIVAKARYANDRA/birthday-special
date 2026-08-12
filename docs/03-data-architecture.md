# "The Journey To My Heart" — Data Architecture
### Prompt 3 Deliverable — Conceptual Data Model Only, No SQL / No Code / No API

This document defines the complete conceptual data architecture underpinning both applications from Prompt 1, built to serve the Content-as-Data principle: nothing the visitor sees is ever hardcoded — it all originates from this data model, authored through the Admin Dashboard.

---

## Core Principle: Content-as-Data

Every entity below exists so that a specific piece of the experience can be authored, changed, reordered, gated, or removed **without a developer touching code**. As a working test for every entity in this document: *"Could the couple's story change next year, and would the admin alone be able to reflect that?"* If not, the entity is missing a field or a relationship.

---

## 1. User Management (Admin Access)

**Entities:**

- **AdminUser** — *Purpose:* represents a person who can log into the Admin Dashboard. *Why it exists:* separates "who can edit the experience" from "who can view it" (visitors never authenticate as users). *Important fields (conceptual):* display name, email/login identifier, password credential (hashed), status (active/disabled), last login timestamp. *Relationships:* one AdminUser creates/edits many content records (Photos, Letters, Memories, etc. — see "created_by"/"updated_by" provenance fields throughout this document). *Lifecycle:* created manually/seeded at project setup (this is a personal project, not a public signup system) → active → optionally disabled if access needs revoking.

- **Role** — *Purpose:* defines a named permission bundle (e.g., "Owner," "Editor"). *Why it exists:* even though Prompt 1 specified a single-admin model at launch, defining Role now means multi-admin support later requires no schema change (Section 17). *Important fields:* role name, description. *Relationships:* many AdminUsers may hold one Role; a Role has many Permissions.

- **Permission** — *Purpose:* atomic capability (e.g., "manage_photos," "publish_content," "view_analytics"). *Relationships:* many-to-many with Role, allowing fine-grained future expansion (e.g., a "viewer-only" collaborator role) without redesigning the access model.

- **AdminSession** — *Purpose:* represents an active authenticated admin session (backing JWT refresh/revocation). *Important fields:* issued time, expiry, device/context info, revoked flag. *Lifecycle:* created at login → active → expires or is explicitly revoked (e.g., "log out all devices").

**How admin access is controlled:** authentication gates entry (who are you), Role/Permission governs capability (what can you do), AdminSession governs duration and revocability (how long can you keep doing it). At launch this resolves to one Owner role with full permissions, but the model doesn't hardcode that assumption.

---

## 2. Visitor Experience Tracking

**Entities:**

- **VisitorSession** — *Purpose:* represents one visitor's journey through the experience, without requiring a traditional account. *Why it exists:* the experience is 30–45 minutes and may span multiple visits/devices — progress must survive a closed tab. *Important fields:* a client-held session token/identifier, created timestamp, last-active timestamp, device/browser context (coarse, non-invasive), current journey stage reference, optional display name if the visitor is invited to enter one (e.g., "Who's exploring today?"). *Relationships:* one VisitorSession has many UnlockedItem records, many GameProgress records, many AchievementProgress records, many AnalyticsEvents. *Lifecycle:* created on first visit → updated continuously as the visitor progresses → dormant after inactivity → optionally resumable indefinitely (this is a keepsake experience; sessions should not hard-expire the way a typical web app's would).

- **SessionRecoveryToken** — *Purpose:* allows a visitor to resume their journey on a different device (e.g., started on phone, wants to continue on a tablet). *Why it exists:* addresses "device changes" explicitly. *Important fields:* recovery code/token, linked VisitorSession, expiry (generous — this isn't a security-critical token, more a convenience mechanism), used flag. *Lifecycle:* generated on request → shown/shared by the visitor to themselves → redeemed once (or limited times) to reattach a new device context to the existing VisitorSession.

- **UnlockedItem** — *Purpose:* records that a specific piece of gated content (a scene, letter, memory, secret room) has been unlocked for a given VisitorSession. *Important fields:* reference to the unlocked content (polymorphic — could point to a Memory, Letter, Scene, SecretMessage), unlock timestamp, which UnlockCondition satisfied it. *Relationships:* many-to-one with VisitorSession; references UnlockCondition (Section 8).

**Privacy considerations:** this is fundamentally a **private, single-purpose gift experience**, not a multi-user public platform — so visitor tracking should be scoped accordingly: no account creation, no email collection unless the admin explicitly wants a "leave me a note back" feature, no third-party analytics/ad tracking, session tokens are opaque and non-guessable, and all visitor data exists solely to power *progress continuity* and *admin-facing analytics about engagement* (Section 13) — never resold, exported, or used beyond this experience.

---

## 3. Media Management

**Entities:**

- **MediaAsset** — *Purpose:* the canonical record for any uploaded file (photo, video, audio), decoupled from Cloudinary specifics. *Why it exists:* every other content type (Memory, Letter, Album) references MediaAsset rather than embedding raw URLs — this indirection is what lets an admin "replace this photo" without touching every place it's referenced. *Important fields:* media type (photo/video/audio), Cloudinary public identifier/reference, alt text/description (accessibility), original filename (provenance), upload timestamp, uploaded-by (AdminUser), file metadata (dimensions/duration where relevant), visibility flag, featured flag. *Relationships:* referenced by Album (via AlbumItem), Memory, Letter (optional attached media), MusicTrack, Background — MediaAsset itself doesn't know its "purpose," it's referenced *by* the entities that give it meaning.
- **Lifecycle of a MediaAsset:** uploaded → (optionally) tagged/categorized → attached to one or more content entities → optionally replaced (a new MediaAsset supersedes it, old one archived rather than hard-deleted — see Section 15) → optionally deleted if truly unwanted.

- **Album** — *Purpose:* a curated, ordered collection of photos/media forming a themed set (e.g., "Our Trip to the Mountains"). *Important fields:* title, description, cover MediaAsset reference, display order, visibility, featured flag. *Relationships:* one Album has many AlbumItem records.

- **AlbumItem** — *Purpose:* the join entity connecting Album ↔ MediaAsset, carrying position-within-album data. *Important fields:* order/position, optional per-item caption. *Why a separate entity instead of a direct many-to-many:* ordering and per-album captions are properties of the *relationship*, not of the MediaAsset itself (the same photo could appear in two albums with different captions/order).

- **Category** and **Tag** — *Purpose:* organizational metadata (Section 12) applicable across MediaAsset, Memory, and other content types generically.

**Cloudinary integration fit:** Cloudinary is purely the **binary storage/delivery layer**; PostgreSQL never stores raw files, only the MediaAsset record referencing Cloudinary's identifier plus admin-facing metadata (captions, tags, ordering, visibility) that Cloudinary itself has no concept of. This keeps "what is this photo, where does it appear, and who can see it" fully within the app's own data model and admin control — Cloudinary only answers "how do I fetch/transform the bytes."

**Support for replace/delete/ordering/visibility/featured:** all handled as fields/states on MediaAsset and Album/AlbumItem rather than requiring destructive operations — "replace" creates a new MediaAsset and repoints references (preserving history per Section 15); "delete" is soft by default (Section 15/16).

---

## 4. Memory System

**Entities:**

- **Memory** — *Purpose:* the core storytelling unit — a specific moment, story, or milestone in the relationship. *Why it exists:* distinct from a raw MediaAsset because a Memory is a *narrative* (title, story text, date, location) that may reference multiple photos/videos/audio, not a single file. *Important fields:* title, story/description text, date (or approximate date/season if exact date is unknown), location (free text or structured place name), category (Timeline/Special Moment/Milestone — see below), importance level, display priority, visibility/unlock state reference. *Relationships:* many-to-many with MediaAsset (a Memory can showcase several photos/a video/a voice note); many-to-one with MemoryCategory; referenced by UnlockCondition when a Memory is gated.

- **MemoryCategory** — *Purpose:* classifies memories (e.g., "Timeline Milestone," "Random Sweet Moment," "Trip," "Anniversary") so the Timeline and Gallery scenes can filter/organize meaningfully. *Important fields:* name, description, associated icon/visual treatment reference (ties to Design System Section 4/9).

- **Importance Level** (a controlled value on Memory, not necessarily its own table) — *Purpose:* drives display prominence (e.g., "Core Milestone" memories get larger treatment on the Timeline than "Small Moment" memories) — directly powers "display priority" requested in the brief.

**Display priority:** an explicit ordering field on Memory (and mirrored on Album, Achievement, etc. wherever admin-controlled sequencing matters) — separate from date, since the admin may want a memory displayed prominently regardless of its chronological position.

**Unlock conditions:** Memory doesn't own unlock logic itself — it *references* an UnlockCondition (Section 8), keeping gating logic centralized and reusable across content types rather than reimplemented per entity.

---

## 5. Love Letter System

**Entities:**

- **Letter** — *Purpose:* a written message meant to be "opened" as a discrete emotional beat (distinct from a Memory's narrative-photo-story format). *Important fields:* title/salutation, body text (long-form, rendered in the handwritten letter treatment), written-date (in-story date, may differ from actual creation date), unlock type (see below), unlock condition reference, visual/paper-style variant reference (ties to Design System). *Relationships:* references UnlockCondition; optionally references a MediaAsset (e.g., a photo tucked "inside" the letter).

- **SecretMessage** — *Purpose:* shorter, more surprise-oriented hidden text (vs. a full Letter) — e.g., a note revealed inside the Secret Room. *Important fields:* content text, reveal style, unlock condition reference. *Why separate from Letter:* different display treatment and typically much shorter/more surprise-driven; keeping them distinct keeps each component's admin editor simple and purpose-built rather than one bloated "message" entity with conditional fields.

**Unlock type support (shared pattern, reused from Section 8's UnlockCondition, specialized here):**
- **Immediate** — visible as soon as its parent scene/section is reached.
- **Game-completion-based** — unlocked after a referenced Game (or specific level) is completed.
- **Time-based** — unlocked at/after a specific real-world date-time (e.g., unlocks exactly at midnight on the birthday) or after a duration since journey start.
- **Password-based** — requires a specific passphrase (distinct from the site-wide visitor password — this is content-specific, e.g., an inside-joke answer).

Each Letter/SecretMessage simply points at one UnlockCondition record configured with the relevant type — no duplicated gating logic per message.

---

## 6. Game Data Architecture (Universal Foundation)

Deliberately generic — no individual game's rules are modeled here, only the shared scaffolding every game plugs into (mirroring the `GameShell` contract from Prompt 1).

**Entities:**

- **Game** — *Purpose:* the catalog entry for a mini-game (Memory Match, Sliding Puzzle, etc.). *Important fields:* name, description, game-type identifier (a code the frontend uses to know which game engine to load — e.g., `"memory_match"`), icon/thumbnail MediaAsset reference, active/enabled flag, display order in the game menu. *Relationships:* one Game has many GameLevel records; referenced by GameProgress and by UnlockCondition (as either a *target* being unlocked, or a *trigger* that unlocks something else).

- **GameLevel** — *Purpose:* a specific difficulty/stage within a Game. *Important fields:* level number/order, difficulty label, level-specific configuration (a flexible structured field — e.g., grid size for Memory Match, obstacle density for the Runner — intentionally generic since each game's config shape differs), unlock requirement (e.g., "previous level completed," or none for level 1). *Relationships:* many-to-one with Game; referenced by GameProgress.

- **GameProgress** — *Purpose:* tracks one VisitorSession's status within one Game/GameLevel. *Important fields:* reference to VisitorSession, reference to Game and GameLevel, status (not started/in progress/completed), best score, number of attempts, last-played timestamp, completion timestamp. *Relationships:* many-to-one with VisitorSession, Game, GameLevel. *Lifecycle:* created on first attempt → updated on each attempt → marked completed (with best score retained) → remains as a permanent record supporting resumability and achievement evaluation.

- **GameReward** — *Purpose:* defines what completing a Game/GameLevel grants (e.g., unlocks a Memory, awards an Achievement, reveals a Letter). *Important fields:* trigger reference (which Game/GameLevel/completion-threshold), reward type, reward target reference (polymorphic — points at whatever is being unlocked/awarded). *Relationships:* effectively a specialized application of UnlockCondition (Section 8) scoped to game-triggered rewards, keeping "what does finishing this game unlock" fully admin-configurable rather than hardcoded per game.

**How new games are added later:** because GameLevel's configuration field is intentionally flexible/structured-but-generic, and Game only needs a name/type-identifier/thumbnail/order to appear in the catalog, adding an 11th game is purely: (1) register a new Game catalog entry with its type identifier, (2) define its GameLevel entries with whatever config shape that game needs, (3) optionally attach GameReward/UnlockCondition entries. No schema change required — this is the direct data-layer counterpart to the `GameShell` contract from the architecture doc.

---

## 7. Achievement System

**Entities:**

- **AchievementDefinition** — *Purpose:* the catalog entry for an earnable achievement (e.g., "Memory Explorer," "Puzzle Master," "Heart Collector," "Birthday Hero"). *Important fields:* name, description, icon/badge visual reference, criteria reference (what must happen to earn it — e.g., "view 10 memories," "complete all puzzle games," "collect X hearts via Love Meter interactions," "complete the full journey"), reward tier (visual/celebratory weight — ties to Design System's gold-reserved-for-achievements rule), display order.

- **AchievementProgress** — *Purpose:* tracks a VisitorSession's progress toward a specific AchievementDefinition, supporting partial/incremental achievements (e.g., "6 of 10 memories viewed"). *Important fields:* reference to VisitorSession and AchievementDefinition, current progress value, target value (denormalized from definition for convenience), earned flag, earned timestamp. *Relationships:* many-to-one with VisitorSession and AchievementDefinition.

**Reward system:** an earned AchievementProgress can itself function as a trigger inside UnlockCondition (Section 8) — e.g., earning "Puzzle Master" unlocks a bonus Letter — reusing the same central gating mechanism rather than a separate achievement-specific unlock system.

---

## 8. Journey Progression Engine

This is the connective tissue of the entire data model — the system that turns a pile of content entities into a *guided* experience.

**Entities:**

- **JourneyStage** — *Purpose:* represents a defined step/chapter in the overall experience (Arrival, World Map, Timeline, Games, Secret Room, Castle, Final Surprise — echoing Prompt 1/2's narrative arc). *Important fields:* name, order/sequence, entry requirement reference (what must be true to enter this stage), associated scene identifier (maps to frontend routing). *Relationships:* referenced by UnlockCondition as both trigger and target context.

- **UnlockCondition** — *Purpose:* the **single centralized rules engine** referenced throughout this document (Sections 2, 4, 5, 6, 7) — this is the entity that makes the entire experience admin-configurable without code. *Important fields:* condition type (immediate/game-completion/time-based/password/achievement-earned/prior-stage-completed/composite-AND/composite-OR), trigger reference(s) (polymorphic — a Game, GameLevel, AchievementDefinition, JourneyStage, or a fixed date-time), target reference (polymorphic — the Memory/Letter/SecretMessage/JourneyStage/Scene being gated). *Relationships:* one UnlockCondition can gate exactly one target, but the *trigger* side may be composite (e.g., "requires Game A completed AND Game B completed") — modeled as either a composite condition type or multiple linked sub-conditions, decided at implementation time, but the conceptual capability (branching/composite gating) is established here.

- **JourneyProgressLog** — *Purpose:* an append-only record of a VisitorSession's stage transitions (entered Stage X at time T), distinct from UnlockedItem (which tracks specific *content* unlocks) — this tracks *narrative position*, useful for both resumability ("take me back to where I left off") and analytics ("where do visitors spend the most time / drop off").

**Support for linear, branching, and optional-secret journeys:**
- **Linear** — the default: JourneyStage records with a strict sequence order, each gated by "previous stage completed."
- **Branching** — supported because UnlockCondition's target/trigger references are flexible enough that a stage could have multiple valid entry paths (e.g., "unlocked after ANY 2 of these 3 games"), rather than a single rigid prerequisite.
- **Optional secrets** — content (a bonus Memory, an Easter-egg SecretMessage) can exist with an UnlockCondition but with **no corresponding JourneyStage gating access to it structurally** — meaning it's discoverable/optional rather than required for main-path progression, simply by not being wired into the primary JourneyStage sequence.

---

## 9. Theme Management

**Entities:**

- **Theme** — *Purpose:* a complete, swappable visual identity package (ties directly to Design System Section 10/16 tokens). *Important fields:* name, color token values (structured — primary/secondary/accent/background/glow sets), typography selections (which font category maps to which actual font family), particle preset reference, active flag, is-default flag, seasonal/special flag (e.g., a "Birthday Mode" theme distinct from the everyday theme). *Relationships:* referenced by JourneyStage or scene-level overrides (a specific stage/scene can reference a Theme override that layers on top of the globally active Theme, per the Design System's override-merge strategy).

- **Background** — *Purpose:* a specific environment asset/configuration (Night Sky, Magical Forest, Castle, etc. from Design System Section 5). *Important fields:* name, associated environment type, particle configuration reference, MediaAsset reference (if using illustrated/painted background art rather than pure procedural rendering), lighting configuration (structured — tone/intensity). *Relationships:* referenced by JourneyStage/scene mapping (which background applies to which stage).

- **AnimationSetting** — *Purpose:* admin-tunable animation parameters (e.g., ambient particle density tier, whether heavy Three.js moments are enabled) — supports both the reduced-motion accessibility requirement and simple admin taste adjustment without code changes. *Important fields:* setting key, value, applicable scope (global/per-stage).

**Special birthday mode & seasonal changes:** modeled simply as additional Theme records with the seasonal/special flag set, and a mechanism (time-based, same UnlockCondition pattern, or a simple admin toggle) determining which Theme is currently "active" — the birthday itself could auto-activate a specific Theme via a time-based condition, giving the admin a genuine "the whole site transforms at midnight" capability purely through data.

---

## 10. Sound Management

**Entities:**

- **MusicTrack** — *Purpose:* background score entries (ties to Design System's "theme-and-variation" musical approach). *Important fields:* MediaAsset reference (audio file), title, mood/variant tag (which scenes it suits), default volume level, loop flag. *Relationships:* referenced by JourneyStage/Theme mapping (which track plays in which context).

- **AmbientSound** — *Purpose:* environment-layered sound (wind, fireflies-chime, etc.). *Important fields:* MediaAsset reference, associated Background/environment, default volume, loop flag.

- **SoundEffect** — *Purpose:* short triggered sounds (button click, achievement chime, unlock sound, celebration swell). *Important fields:* MediaAsset reference, trigger type/key (e.g., `"button_click"`, `"achievement_earned"`, `"unlock_reveal"`, `"birthday_celebration"` — a defined vocabulary the frontend maps its interaction events to), volume level.

- **SoundSetting** (could be per-VisitorSession, client-stored, or a lightweight backend record) — *Purpose:* remembers a visitor's mute/volume preference across the session for continuity (ties to Accessibility Section 14 requirement for persistent user control).

**Trigger conditions:** SoundEffect's trigger-type field is the key mechanism — the frontend fires a named event (e.g., "achievement_earned"), and whichever SoundEffect record(s) are mapped to that trigger key play, meaning the *actual sound file* is fully swappable by the admin without touching frontend code.

---

## 11. Admin Content Workflow

Rather than inventing a separate "workflow" entity per content type, a **shared status/lifecycle pattern** is applied consistently across all content entities (Memory, Letter, Album, Photo, Game, Theme, etc.):

- **ContentStatus** (a field present on every content-bearing entity, not a separate table) — values: **Draft** (being authored, not visible to visitors) → **Scheduled** (approved, with a future publish date-time) → **Published** (live/visible, subject to its own UnlockCondition gating) → **Archived** (removed from the active experience but retained, not deleted — feeds Section 15 versioning).

- **PublishSchedule** (as fields on the content entity, or a small linked entity where richer scheduling is needed) — *Purpose:* supports "prepare content now, reveal it later" independent of the UnlockCondition system (this is *admin-side* scheduling — "don't even show this in visitor consideration until date X" — distinct from *visitor-facing* unlock gating, which assumes the content is already published and simply hidden by narrative gating).

**Approval workflow:** given this is a single-admin (or small trusted-team) personal project rather than a multi-contributor CMS, a heavy multi-stage approval workflow is **not warranted** — the Draft → Scheduled → Published → Archived status pattern alone provides sufficient control. The data model deliberately avoids over-engineering an approval-chain/reviewer-role system that Prompt 1's single-admin scope doesn't call for, while the Role/Permission foundation from Section 1 leaves room to add one later if the project ever grows multiple contributors.

**Preview:** supported not by a distinct entity but by the Admin Dashboard simply being able to render Draft/Scheduled content through the same rendering logic as Published content, scoped to admin-only access — a capability of the application, not an additional data structure.

---

## 12. Search and Organization

**Entities:**

- **Tag** — *Purpose:* free-form, admin-defined labels (e.g., "trip," "funny," "milestone") applicable across multiple content types generically. *Relationships:* many-to-many with MediaAsset, Memory, Album, Letter (a generic polymorphic tagging join, or type-specific join tables depending on implementation preference — conceptually many-to-many regardless).

- **Category** — *Purpose:* a more structured, typically single-select classification (distinct from freeform multi-select Tags) — e.g., MemoryCategory (Section 4) is a specialized form of this general pattern.

- **Collection** — *Purpose:* an admin-curated grouping that can span content types (e.g., a "Favorites Reel" collection mixing specific Memories, Photos, and a Letter together) — distinct from Album (which is photo/media-specific) by being intentionally cross-content-type.

- **Favorite flag** — a boolean field present on relevant content entities (Memory, MediaAsset) allowing the admin to mark standout content for prioritized display, independent of Tag/Category/Collection membership.

- **Display priority/order** — as established in Section 4, an explicit ordering field present wherever admin-controlled sequencing matters (Memory, Album, AlbumItem, Game, AchievementDefinition, JourneyStage) rather than relying purely on creation date or alphabetical fallback.

---

## 13. Analytics Data

**Entities:**

- **AnalyticsEvent** — *Purpose:* a single append-only record of a meaningful visitor action. *Important fields:* reference to VisitorSession, event type (e.g., `"scene_entered"`, `"memory_opened"`, `"game_started"`, `"game_completed"`, `"letter_opened"`, `"achievement_earned"`), reference to the relevant content entity (polymorphic), timestamp, coarse duration-on-scene where relevant. *Relationships:* many-to-one with VisitorSession.

**Derived/aggregate views (computed from AnalyticsEvent, not separately stored raw data):**
- Pages/scenes visited & time spent — derived from sequential `scene_entered` events and their timestamp deltas.
- Memories opened — count/distinct of `memory_opened` events.
- Games played & completion rate — derived from `game_started` vs. `game_completed` event pairs per Game.
- Most-loved content — ranking content entities by open/interaction frequency across AnalyticsEvent.

**Privacy-conscious design:** AnalyticsEvent intentionally tracks *behavior relative to content* (what was viewed/played, for how long, in what order) and **not** identity, location, or device fingerprinting beyond what VisitorSession already coarsely holds — this is engagement analytics for the admin's own curiosity/insight into "how did they experience the gift," not surveillance, and should never be extended toward third-party tracking or ad-related telemetry.

---

## 14. Database Relationship Overview

**One-to-one relationships:**
- AchievementProgress ↔ (VisitorSession, AchievementDefinition) pairing is effectively one-to-one *per pair*, though each side individually is one-to-many.
- SoundSetting ↔ VisitorSession (one preference record per session), if modeled server-side.

**One-to-many relationships (the majority of the model):**
- AdminUser → many content records (as creator/editor, provenance field)
- Album → many AlbumItem
- Game → many GameLevel
- VisitorSession → many GameProgress, AchievementProgress, UnlockedItem, AnalyticsEvent, JourneyProgressLog
- MemoryCategory → many Memory
- JourneyStage → many UnlockCondition (as target context)

**Many-to-many relationships:**
- Memory ↔ MediaAsset (a memory showcases several media items; a media item like a group photo could appear in several memories)
- Album ↔ MediaAsset (via AlbumItem, carrying order/caption)
- Content entities (Memory, MediaAsset, Album, Letter) ↔ Tag
- Role ↔ Permission

**Conceptual ER description (prose, no diagram):**
At the center sits **VisitorSession**, radiating out to every record of *what this visitor has done* (GameProgress, AchievementProgress, UnlockedItem, AnalyticsEvent, JourneyProgressLog). Parallel to that, a **content cluster** (Memory, Letter, SecretMessage, Album/MediaAsset, Game/GameLevel, AchievementDefinition, Theme/Background, MusicTrack/SoundEffect) represents *what exists to be experienced*, entirely authored and controlled by **AdminUser** through Role/Permission-gated access. The two clusters are bridged by **UnlockCondition**, which is the pivot entity translating "what the visitor has done" into "what becomes visible to them next" — every gating relationship in the entire system, across memories, letters, games, and journey stages, routes through this one mechanism rather than being reimplemented per feature. **JourneyStage** provides the backbone sequence that both the admin (for structuring the experience) and the analytics layer (for measuring drop-off/pacing) key off of.

---

## 15. Content Versioning

- Every content entity's "delete" is conceptually a **soft delete/archive** (ties to Section 11's Archived status) rather than a hard row removal — this alone preserves basic history and enables rollback for the most common case ("I didn't mean to remove that").
- **MediaAsset replacement**, as noted in Section 3, creates a **new** MediaAsset record and repoints the referencing entity's active reference, while the prior MediaAsset is retained in an archived state rather than overwritten in place — meaning "what did this photo used to be" is always recoverable.
- For text-heavy content (Letter body, Memory story text) where an admin might revise wording multiple times, a lightweight **ContentRevision** pattern is worth establishing conceptually: each edit creates a new revision record (content snapshot + timestamp + editor) linked to the parent entity, with one revision flagged current/active — giving true rollback ("restore the previous wording") rather than only archive/restore at the whole-entity level.
- **Rollback**, functionally, means: reactivating an Archived record, or promoting a prior ContentRevision back to current — both are state changes on existing data, never data reconstruction from nothing, which is why the soft-delete/revision approach is foundational rather than an add-on.

---

## 16. Security Considerations

- **Sensitive photos/private letters:** all MediaAsset and Letter/SecretMessage content is delivered only through the gated visitor-password flow (Prompt 1 Section 13) and admin JWT auth — Cloudinary assets should be stored/delivered in a way that isn't publicly indexable or guessable (unlisted delivery type, non-sequential/non-guessable identifiers), so "security through obscurity" is not the *only* layer, but it reinforces the password gate.
- **Admin security:** AdminUser credentials hashed (never stored plain), AdminSession tokens support explicit revocation, and Role/Permission ensures that even if the project grows beyond one admin, access can be scoped narrowly (e.g., a helper who can upload photos but not edit Letters).
- **Media access:** MediaAsset records never expose raw, permanent public URLs in visitor-facing data if avoidable — signed/expiring delivery URLs (Cloudinary-native capability) are preferable, generated per-request rather than stored statically, keeping control with the backend rather than baked into cached frontend data.
- **Passwords:** two distinct password concepts exist in this model and must not be conflated — the **site-wide visitor password** (coarse gate on the whole experience) and **content-specific passwords** on individual Letters/SecretMessages (Section 5) — both should be hashed/compared server-side, never shipped to the frontend in plaintext even temporarily.
- **Session security:** VisitorSession tokens are opaque, unguessable, and scoped only to progress-tracking data (never granting access to admin capability); SessionRecoveryToken is deliberately lower-stakes (convenience, not security-critical) but still time-limited and single-use to avoid casual token sharing becoming a persistent backdoor.
- **Data protection:** the entire dataset (photos, letters, personal stories) is inherently sensitive personal/relationship data even though it involves no financial or legal PII — the model treats it with genuine care (no third-party analytics injection, no public indexing, admin-only export capability) even though formal regulatory compliance (GDPR/CCPA) is likely out of scope for a two-person personal gift project.

---

## 17. Scalability Considerations

- **More memories/media:** Memory and MediaAsset are unbounded, tag/category-driven collections from day one — no schema assumption caps their count, and Display priority/Favorite/Collection mechanisms (Section 12) keep large volumes curatable rather than becoming an unsorted dump.
- **More games:** Section 6's generic Game/GameLevel/GameProgress foundation is explicitly designed so an 11th, 12th, or 20th game requires new *data* (catalog + levels), not new *tables* — the scalability path is content authoring, not schema migration.
- **More visitors/users:** while this specific project is scoped to one recipient, VisitorSession is not artificially limited to a single concurrent visitor — the same data model would support, for example, multiple family members exploring at different times, or the birthday recipient revisiting years later, without redesign.
- **More future events:** because JourneyStage, Theme, and UnlockCondition are all fully data-driven (Section 9), the *same* underlying schema could plausibly support an entirely different future occasion (an anniversary edition, a proposal version) as a fresh set of content rows rather than a new application — the architecture's content-as-data discipline is what makes this realistic rather than aspirational.
- **Admin team growth:** Role/Permission (Section 1) is already in place structurally even though only one role is used at launch, avoiding a future breaking migration if a second trusted collaborator ever needs access.

---

## 18. Final Architecture Summary

**Complete data architecture overview:** the model is organized around a small number of *pivot concepts* — **VisitorSession** (what the visitor has experienced), **UnlockCondition** (the single centralized gating engine translating visitor actions into newly visible content), **JourneyStage** (the narrative backbone sequence), and **MediaAsset** (the indirection layer between raw Cloudinary files and every content type that displays them) — with all authored content (Memory, Letter, SecretMessage, Game/GameLevel, AchievementDefinition, Theme/Background, MusicTrack/SoundEffect) built as peers around that core, each following the same shared status/versioning/organization patterns (Sections 11, 12, 15) rather than bespoke per-type conventions.

**Core entities list:** AdminUser, Role, Permission, AdminSession · VisitorSession, SessionRecoveryToken, UnlockedItem · MediaAsset, Album, AlbumItem · Memory, MemoryCategory · Letter, SecretMessage · Game, GameLevel, GameProgress, GameReward · AchievementDefinition, AchievementProgress · JourneyStage, UnlockCondition, JourneyProgressLog · Theme, Background, AnimationSetting · MusicTrack, AmbientSound, SoundEffect, SoundSetting · Tag, Category, Collection · AnalyticsEvent · ContentRevision.

**Relationship summary:** overwhelmingly one-to-many radiating from AdminUser (authorship) and VisitorSession (experience tracking), with many-to-many joins specifically for Media↔Memory/Album, and Content↔Tag — and a single unifying many-referenced pivot (UnlockCondition) that every gated content type routes through, avoiding N separate gating implementations.

**How Admin controls everything:** every visitor-facing decision point — what's visible, what unlocks what, what it looks/sounds like, what order things appear in — is a field or relationship the admin edits directly (Draft→Published status, UnlockCondition rules, Display priority, Theme selection, Tag/Category/Collection curation), with zero content requiring a code deployment to change.

**How the user experience consumes the data:** the frontend (per Prompt 1's API layer) reads Published, unlock-satisfied content scoped to the requesting VisitorSession — Memories/Letters/Games/Themes are fetched as data and rendered through the Design System's component language (Prompt 2), meaning the entire "magical world" the visitor walks through is, structurally, just this data model being read and beautifully rendered.

---

**Waiting for Prompt 4.**
