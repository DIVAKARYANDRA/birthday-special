# "The Journey To My Heart" — Visual Design System
### Prompt 2 Deliverable — Design Specification Only, No Code

This document is the binding design language for every future implementation prompt. It builds on the architecture defined in Prompt 1 and must be treated as the single source of truth for anything visual, motion-related, or tonal.

---

## 1. Brand Identity

**Personality:** Warm, wondrous, intimate, a little mischievous, deeply sincere underneath the sparkle. Think "a fairytale that knows your name," not generic fantasy.

**Emotional tone:** Gentle build from curiosity → delight → nostalgia → tenderness → joy. Never loud or gimmicky; magic here is *soft-spoken*, not flashy for its own sake.

**Visual identity:** Dreamlike realism — grounded photo memories (real photos, real letters) staged inside a stylized, painterly fantasy world. The contrast between "real" content and "magical" framing is the entire visual thesis: ordinary memories treated as extraordinary treasure.

**Storytelling style:** First-person fairytale narration. The visitor is the protagonist of their own love story, guided (not lectured) through chapters. Copy and pacing borrow from storybook cadence: short reveals, gentle cliffhangers, earned payoffs.

**Typography personality:** Elegant serif/script pairing for emotional beats, clean humanist sans for functional UI — never let decoration compromise legibility.

**Animation personality:** Floaty, buoyant, weighted with "hand of a Ghibli animator" easing — nothing snaps or jitters; everything breathes, drifts, settles.

**Interaction personality:** Every tap/click feels *acknowledged* — a small reward (glow, sparkle, sound) for every meaningful action, reinforcing "this world notices you."

**How the visitor should feel:** Like they've been handed a key to a private world built only for them — welcomed, charmed, occasionally surprised, and by the end, moved.

---

## 2. Color System

**Primary Palette — "Twilight Romance"**
- Primary Violet (deep magical purple) — hero backgrounds, primary CTAs, world-map base
- Primary Rose (warm blush pink) — romantic accents, love-themed UI, hearts
- Primary Midnight Blue — night-sky scenes, base canvas for ambient environments

**Secondary Palette**
- Secondary Gold (warm champagne gold) — premium accents, borders, certificate/achievement framing
- Secondary Lavender — soft supporting surfaces, secondary panels
- Secondary Coral — playful game-world accents, energetic moments

**Accent Colors**
- Sparkle White (near-white with warm tint) — particle highlights, glow cores
- Firefly Amber — ambient particle accents, magical forest scenes
- Petal Pink — flower/garden environment accents

**Background & Surface**
- Background Deep (near-black violet) — base canvas behind all scenes, lets particles/glow pop
- Surface Glass (translucent white/violet, low opacity) — glassmorphic panels, cards, modals
- Surface Elevated (slightly lighter glass tone) — hover/focus states, raised elements

**Text Colors**
- Text Primary (warm off-white) — body copy on dark backgrounds
- Text Secondary (muted lavender-grey) — captions, metadata, timestamps
- Text Emphasis (gold) — emotionally significant words, key reveals
- Text Ink (deep brown/black) — used only inside "paper" contexts (letters, certificates) for realism

**Glow & Magic Effect Colors**
- Glow Violet — default magical glow (buttons, unlock effects)
- Glow Gold — achievement/reward glow
- Glow Rose — love/heart-themed glow (Love Meter, Love Counter)
- Glow Teal (rare, reserved) — secret/mystery content, Secret Room accent

**Success / Reward Colors**
- Success Green (soft, desaturated — never clinical) — form success states in Admin only
- Reward Gold — game rewards, achievements, unlocks (primary celebratory color)
- Reward Rose — romantic-content unlocks specifically (letters, memories)

**Usage rule:** Gold is *reserved* for achievement/reward/premium moments — if gold appears everywhere, it stops meaning "special." Violet/Rose carry the everyday emotional palette; Gold is earned.

---

## 3. Typography System

**Font categories (by role, not specific families — selection happens at implementation time within these categories):**

- **Display/Heading — Elegant Serif or Fantasy Display face.** Used for scene titles, chapter headers, the project name itself. Should feel storybook/luxury-invitation, slightly ornamental at large sizes.
- **Subheading — Refined Serif (lighter weight) or Elegant Script (sparingly).** Used for scene subtitles, emotional taglines. Script reserved for truly special one-off moments (e.g., "Happy Birthday, My Love") — never for repeated UI.
- **Body — Modern Humanist Sans.** Used for all functional/readable content: descriptions, navigation labels, game instructions, admin UI. Must prioritize legibility over personality.
- **Handwritten Love Letters — Handwriting-style script font.** Used exclusively inside the Letters feature, rendered on a paper/parchment texture background to reinforce the "real letter" illusion. Never used outside that context.
- **Game Text/HUD — Rounded, playful Sans (friendly, slightly bold).** Distinct from body text to visually separate "we are now playing a game" from "we are in the story."
- **Achievement/Celebration Text — Display serif or fantasy face, gold-emphasis, larger scale, often paired with a glow/shine treatment.** Reserved for reward moments only.

**Usage map:**
| Context | Style |
|---|---|
| Scene titles, World Map labels | Display/Heading |
| Emotional taglines, quotes | Subheading (serif/script) |
| Navigation, descriptions, admin forms | Body sans |
| Letters content | Handwritten script |
| Game HUD, scores, timers | Game rounded sans |
| Achievements, unlocks, birthday moment | Celebration display + gold |

**Typographic scale** should follow a modular scale (defined conceptually in Section 16), with generous line-height on body copy (readability inside a busy animated environment matters more than density).

---

## 4. Design Component Language

General cross-component rules first, then per-component notes.

**Universal rules:**
- **Shape:** Soft, rounded corners throughout (nothing sharp/rectangular — sharp corners read as "app," not "fairytale"). Radius scales with component size.
- **Border style:** Thin, glowing hairline borders (often gradient violet→gold) rather than solid hard borders — borders should feel like light, not ink.
- **Shadow:** Soft, diffused, colored shadows (violet/rose-tinted, not flat grey) — shadows should feel like ambient glow falloff, not literal drop shadows.
- **Glow:** Used purposefully to indicate interactivity, magic, or reward — never applied uniformly to everything (glow fatigue kills the effect).
- **Animation behavior:** Entrances float/fade in with slight scale and vertical drift; nothing appears abruptly.
- **Hover behavior (desktop):** Gentle scale-up (subtle, ~2–4%), glow intensification, slight lift (shadow grows).
- **Click/tap behavior:** Brief compress-then-release (satisfying "squish"), paired with a small particle burst or sparkle on emotionally significant actions.

**Per-component specifics:**

- **Buttons:** Pill or soft-rounded rect, glassmorphic or gradient fill, glowing edge; primary buttons carry a subtle idle "breathing" glow pulse to invite interaction.
- **Cards (memory/content cards):** Glass panels with soft rounded corners, faint inner glow, slight parallax tilt on hover (desktop) — feels like a floating relic, not a flat UI card.
- **Glass panels:** Frosted translucency over ambient background, blurred backdrop, thin gradient border — the primary "premium" surface language across the whole site.
- **Modals/Dialogs:** Center-stage with a soft radial glow behind them separating them from the scene; entrance is a gentle scale+fade, never a hard slide.
- **Tooltips:** Small glass chips with a soft fade-in, appear with slight delay (never instant) to feel considered rather than mechanical.
- **Navigation:** World-Map-based primary navigation (not a conventional navbar) — supplemented by a minimal, collapsible wayfinding element for secondary/utility navigation (settings, audio toggle).
- **Badges:** Small circular/shield-shaped glowing icons, gold for achievements, rose for love-milestones.
- **Achievement cards:** Certificate-like framing, gold border, shine-sweep animation on reveal, slight "unlock" particle burst.
- **Game UI:** Rounded HUD elements, playful color accents (coral/gold), distinct from narrative-scene chrome so games feel like a fun detour within the fairytale, not a jarring app switch.
- **Progress bars:** Curved/organic shape (not a hard rectangle) — think "flowing light" rather than a loading bar; fills with a gradient glow sweep.
- **Unlock animations:** Light bloom expanding outward, particles releasing upward, a soft chime-timed reveal of the newly unlocked content.
- **Memory cards:** Polaroid-inspired with slight rotation variance, soft paper-shadow, warm off-white borders.
- **Photo frames:** Vary by context — polaroid (gallery), ornate gold frame (favorited/milestone photos), torn-edge paper (candid memories).
- **Letters:** Envelope-and-wax-seal opening interaction, unfolding paper animation, handwritten type on textured parchment.
- **Certificates:** (for major achievements/final surprise) ornate gold-bordered parchment, wax seal, elegant serif typography, shine-sweep reveal.

---

## 5. Background World Design

| Environment | Colors | Particles | Lighting | Objects | Movement | Atmosphere |
|---|---|---|---|---|---|---|
| **Night Sky** | Midnight blue, violet gradient | Stars, occasional shooting star | Soft moonlight glow, low ambient | Moon, distant clouds | Slow drifting clouds, twinkling stars | Calm, vast, wondrous — sets the "entering a world" tone |
| **Magical Forest** | Deep teal-green, violet undertones | Fireflies, floating pollen/sparkles | Dappled moonlight shafts | Silhouetted trees, glowing flowers | Gentle sway, firefly drift paths | Mysterious, intimate, alive |
| **Memory Garden** | Warm rose/lavender pastels | Falling petals, soft sparkles | Warm golden-hour glow | Blooming flowers, vines, garden arches | Petals falling, flowers gently swaying | Nostalgic, tender, warm |
| **Castle** | Gold, deep violet, warm amber interior light | Ambient dust motes, faint sparkle | Warm torchlight/candle glow, dramatic uplighting | Towers, stained glass, banners | Flags gently waving, torch flicker | Grand, celebratory, climactic |
| **Birthday Room** | Warm gold, rose, confetti-bright accents | Confetti, balloons drifting, sparkles | Bright warm celebratory glow | Balloons, cake, gifts, banners | Balloon float, confetti fall | Joyful, festive, celebratory peak |
| **Game Worlds** | Coral/gold energetic variants of base palette | Context-specific (stars for space runner, hearts for cupid game) | Brighter, higher-contrast than narrative scenes | Game-specific props | Playful, snappier (but never jarring) motion | Fun, energetic, lighter-hearted than narrative scenes |
| **Secret Room** | Deep teal/violet, low-key | Slow-drifting magic dust, rare sparkle | Low, mysterious, single soft light source | Locked chest, glowing artifact, curtains | Very slow, hushed motion | Intimate, hushed, "just us" secrecy |

---

## 6. User Journey Visual Flow

| Stage | Emotion | Visual Treatment |
|---|---|---|
| **1. Arrival** | Curiosity | Dark, minimal, near-empty canvas; single glowing point of interest invites the first tap; restraint builds intrigue |
| **2. Discovery** | Wonder | World Map reveals itself with a bloom of light and particles; palette opens up from near-black to full night-sky richness |
| **3. Nostalgia** | Warmth | Timeline/Gallery scenes shift toward warmer, softer Memory Garden tones; pacing slows; motion becomes gentler |
| **4. Fun** | Playfulness | Game worlds introduce brighter, higher-energy palette (coral/gold), snappier (but still soft) motion, HUD-driven UI |
| **5. Intimacy** | Tenderness | Secret Room/Letters shift to hushed, low-light, single-focus staging — the visual "volume" turns down so the content can carry full weight |
| **6. Emotion** | Deep feeling | Castle scene — grand, warm, golden; lighting intensifies as if the whole world is leaning in |
| **7. Celebration** | Joy | Birthday Room/Final Surprise — full palette bloom, confetti, maximum (but still tasteful) particle density, triumphant typography |

**Principle:** color temperature, particle density, and motion energy all rise and fall deliberately with the emotional arc — the visual system is a mood curve, not a flat aesthetic.

---

## 7. Animation Design System

**Categories & guidance:**
- **Page/scene transitions:** Cross-fade combined with a soft directional drift (never a hard cut or jarring slide); duration ~600–900ms.
- **Object entrance:** Fade + scale-up from 95%→100% + slight upward drift; staggered for groups of elements (cards, particles) so nothing appears all at once.
- **Object exit:** Mirror of entrance, slightly faster than entrance (exits should feel quicker than arrivals — don't make the user wait to leave).
- **Hover effects:** Subtle scale (2–4%) + glow intensify; ~150–250ms, easing out.
- **Click/tap effects:** Quick compress (~100ms) then spring back; paired with particle/sparkle burst for meaningful actions only.
- **Loading animations:** Ambient, in-world (a drifting firefly, a shimmering portal) rather than a generic spinner — loading states are also "in universe."
- **Reward animations:** Radial light bloom + particle release + brief scale-pulse on the rewarded object; 800ms–1.2s, unhurried.
- **Achievement animations:** Certificate/badge scale-in with shine-sweep across the surface, gold particle trail.
- **Game animations:** Snappier than narrative scenes (mid-range duration, ~200–400ms) to keep gameplay responsive, but retain soft easing (never linear/mechanical).
- **Celebration animations:** Largest scale, longest duration, layered (confetti + glow + typography reveal sequenced, not simultaneous) for the climax moments only.

**Duration guideline bands:** Micro-interactions 100–250ms · Standard UI motion 250–500ms · Scene choreography 600ms–1.5s · Celebration sequences 1.5–3s (composed of multiple layered beats).

**Easing guideline:** Default to soft ease-out for entrances, ease-in-out for looping/ambient motion, gentle spring/overshoot reserved for reward and celebration moments only (overuse of spring/bounce cheapens the effect).

**Tool selection guide:**
- **CSS animation:** Simple, low-cost, looping ambient effects where React state isn't needed (subtle idle glows, background gradient shifts).
- **Framer Motion:** Component-level entrance/exit, hover/tap states, layout transitions — anything tied to React component lifecycle.
- **GSAP:** Complex, multi-step choreographed sequences (scene transitions, reveal sequences, timeline-driven moments) requiring precise sequencing/scrubbing.
- **Three.js:** Reserved for a small number of high-impact "wow" moments (Castle reveal, Final Surprise) — never the default rendering path.
- **Lottie:** Pre-designed vector animations for specific illustrated moments (character animations, celebratory icon sequences) where hand-crafted motion design exceeds what's practical to build parametrically.

---

## 8. Particle Effect System

| Effect | Where It Appears |
|---|---|
| **Hearts** | Love Meter/Counter interactions, romantic milestone reveals, letter-opening moments |
| **Stars** | Night Sky ambient background, World Map, achievement reveals |
| **Fireflies** | Magical Forest environment, Secret Room ambient, idle-state ambient embellishment |
| **Flower petals** | Memory Garden, Timeline entrance transitions, nostalgic content reveals |
| **Sparkles** | Universal micro-reward — button interactions, unlocks, hover glints on premium elements |
| **Confetti** | Birthday Room, Final Surprise, major achievement completion, game win states |
| **Magic dust** | Scene transitions, Secret Room ambient, portal/threshold moments (entering a new scene) |
| **Snow** (optional seasonal variant) | Reserved/optional environment variant if theme calls for it — not default |
| **Rain** (optional mood variant) | Reserved for a specific emotional/nostalgic beat if the narrative calls for it — used sparingly, not default weather |

**Principle:** particle type should always be *narratively motivated* (why is this effect here?) rather than decorative filler — each effect is assigned meaning, not scattered generically.

---

## 9. Photo Experience Design

- **Gallery style:** Not a grid — a loosely scattered, floating arrangement (masonry-with-personality) that feels like an open memory box rather than a file browser.
- **Polaroid style:** Slight random rotation per photo, warm off-white border, soft drop shadow, subtle idle float/sway animation (barely perceptible, like it's pinned to a string).
- **Memory cards:** Photo + short caption/date combo, glass-panel mounted, gentle hover-lift with parallax tilt.
- **Photo reveal animations:** Photos "develop" into view (soft blur-to-sharp + fade, evoking a polaroid developing) rather than a plain fade-in.
- **Photo transitions (lightbox):** Cross-fade with slight zoom, ambient background dims and blurs behind the focused photo to create intimate focus.
- **Photo interactions:** Tap/click to enlarge into a focused "memory moment" view with caption and date revealed in handwritten-adjacent styling; swipe/drag to move between photos within an album, mimicking flipping through a physical stack.

**Core principle:** every photo interaction should reinforce "this is a treasured memory being handled with care," never "this is an image asset being displayed efficiently."

---

## 10. Game Design Language

**Shared visual system across all 10 games** (mapped to the `GameShell` architecture from Prompt 1):

- **Game menu:** Consistent card-based selection screen, each game represented by an illustrated icon tile in the shared visual language (soft-rounded, glass, glowing on hover).
- **Level selection:** Path/map-style progression (echoing the World Map's node system) rather than a flat list — reinforces the "journey" framing even inside games.
- **Lives/attempts:** Represented as small heart icons (ties back to core brand motif) rather than generic numeric counters.
- **Score:** Rounded HUD chip, gold-accented number, gentle count-up animation rather than instant value jumps.
- **Rewards:** Consistent reward-burst animation (Section 7) triggered identically across all games for consistency.
- **Achievements:** Same certificate/badge component from Section 4, regardless of which game triggered it.
- **Game completion (win):** Warm, celebratory — light bloom, confetti-lite, encouraging copy in the brand's storybook voice.
- **Failure state:** Soft, non-punitive — gentle color dim (never harsh red/error tones), encouraging retry copy, no jarring negative sound.
- **Restart screen:** Same glass-panel modal treatment as the rest of the site — never a bare/default browser-alert-style prompt.

**Principle:** a visitor should never feel like they've "left" the fairytale to play a generic web game — every game is reskinned to the same design tokens, palette, and motion language as the narrative scenes.

---

## 11. Character Design

Optional, but architected consistently if used:

- **Cute guide (e.g., a small firefly-spirit or fairy):** Soft, rounded, glowing silhouette rather than a fully rendered mascot — cheaper to animate consistently and fits the "magic dust given form" aesthetic.
- **Teddy companion:** Rendered as a warm illustrated static/lightly-animated companion appearing at specific emotional beats (e.g., accompanying the Letters scene) rather than a persistent constant presence — a companion, not a UI chrome element.
- **Fairy assistant:** Could serve as the World Map's "guide" — appears briefly at each new scene unlock to offer a short storybook-voice hint, then fades — functional (wayfinding) and emotional (companionship) at once.
- **Avatar style:** If a visitor avatar/cursor-follower is used, keep it subtle — a soft trailing sparkle/glow rather than a literal character following the cursor.
- **NPC style:** Any characters appearing inside games should match the same soft-rounded, glowing-outline illustrated style — no jarring shift to a different art style per game.

**Interaction principle:** characters *react*, they don't lecture — brief, warm, optional flourishes (a wave, a sparkle-trail, a short line of encouragement), never blocking or mandatory dialogue the visitor must click through.

---

## 12. Sound Design

- **Background music:** Soft orchestral/ambient-fantasy score, shifts subtly per scene (theme-and-variation approach — one cohesive musical identity with mood variants per environment) rather than fully different tracks per scene, so the experience feels musically unified.
- **Ambient sounds:** Environment-specific — soft wind/rustle in Magical Forest, distant sparkle-chimes in Night Sky, warm ambient murmur in Birthday Room — layered quietly under the music, never competing with it.
- **Button/interaction sounds:** Light, soft chime/sparkle tick — consistent single sound family across all clickable elements for cohesion.
- **Achievement sounds:** A distinct, slightly more elaborate chime/flourish — should feel rarer and more special than the standard interaction sound.
- **Game sounds:** Slightly more playful/arcade-adjacent sound family (still soft, never harsh 8-bit beeps) — distinguishes "game mode" audibly, matching the visual HUD shift.
- **Birthday celebration sound:** The emotional/musical peak — a fuller musical swell reserved exclusively for the Final Surprise moment, never reused elsewhere (protects its impact).

**Trigger principle:** sound reinforces the same "every interaction is acknowledged" rule as motion — but must always be user-controllable (Section 14) and never mandatory for comprehension.

---

## 13. Responsive Design System

| Aspect | Desktop | Tablet | Mobile |
|---|---|---|---|
| **Layout density** | Full immersive canvas, multi-element scenes | Slightly simplified scene composition | Single-focus, vertically stacked scene composition |
| **Ambient particle density** | Full density | Medium density | Reduced density (performance-tiered, per Prompt 1 Section 15) |
| **Navigation** | World Map with hover-revealed detail | World Map with tap-revealed detail | Simplified/compact World Map or list-style scene picker fallback |
| **Hover states** | Full hover language (lift, glow, tilt) | Reduced/tap-triggered equivalents | Replaced entirely by tap/press feedback (no hover dependency) |
| **Game controls** | Mouse/keyboard, precise pointer interactions | Touch-first, larger hit targets | Touch-first, largest hit targets, simplified control schemes (e.g., swipe/tap over drag-precision where possible) |
| **Three.js/heavy effects** | Full fidelity | Reduced fidelity | Fallback to lighter effects or static imagery per device capability |
| **Typography scale** | Full display scale | Slightly reduced | Compact scale, prioritizing readability over dramatic size |

**Principle:** mobile isn't "desktop shrunk down" — scene composition is intentionally re-staged per breakpoint so the magic still reads at a smaller, touch-first scale.

---

## 14. Accessibility Design

- **Readable text:** Body text never drops below a comfortable minimum size; decorative fonts (script/handwritten) reserved for short, non-critical text only — never for lengthy required-reading content.
- **Contrast:** All functional text meets accessible contrast ratios against its background even within moody/dark environments (achieved via text-shadow/scrim behind text where the background is busy, rather than compromising the background art).
- **Keyboard support:** All interactive elements (World Map nodes, buttons, modals, game controls where feasible) reachable and operable via keyboard, with a visible (but on-brand — glowing outline, not a default browser rectangle) focus state.
- **Reduced motion:** A global toggle/detection (per Prompt 1 Section 9) swaps ambient particle systems and large choreographed transitions for simpler fades — content and progression remain fully accessible without motion.
- **Sound controls:** Persistent, easily discoverable mute/volume control from the very first scene — sound is an enhancement, never a requirement for progressing.
- **Alternative interactions:** Any drag-based game/interaction has a tap-based alternative path where feasible, so mobility-limited visitors aren't blocked from progression-critical content.

---

## 15. Admin Dashboard Design System

The Admin Dashboard shares the brand's DNA but is dialed toward clarity and efficiency — the admin is a *tool*, the user site is the *experience*.

- **Overall tone:** Clean, professional, calm — glassmorphic surfaces and the same color/typography tokens as the user site, but with reduced ambient animation/particles (a working environment, not an immersive one).
- **Dashboard:** Card-based overview (content counts, recent activity, quick links) using the same glass-panel language, minimal ambient background (a subtle static gradient, no heavy particle load).
- **Sidebar:** Fixed, icon+label navigation mirroring the module list from Prompt 1 Section 4, using brand color accents for active states.
- **Forms:** Clean, generously spaced, clear labels, on-brand rounded inputs with soft focus glow — but no decorative flourish that would slow down repeated data entry.
- **Upload areas:** Friendly drag-and-drop zones with soft glow on drag-over, clear progress indication, thumbnail preview immediately on upload.
- **Tables:** Clean, readable row-based lists (for content management) with subtle hover highlighting, on-brand rounded container, but restrained (no glow/particle treatment — legibility over magic here).
- **Analytics:** Data visualizations in brand-consistent colors (violet/gold/rose palette applied to charts), presented in glass-panel cards.
- **Editors (content editing screens):** Split-view pattern — form on one side, **live preview of how it will render on the user site** on the other, so admins always see the "magic" result of their edits even while working in a functional tool.

**Principle:** the admin should feel like it belongs to the same universe (same tokens, same palette, same type system) while prioritizing speed and clarity over spectacle — restraint here is intentional, not a downgrade.

---

## 16. Design Tokens (Conceptual)

**Spacing scale:** A consistent modular scale (e.g., xs/sm/md/lg/xl/2xl/3xl conceptually) used for all padding/margin/gaps — generous spacing throughout to preserve the "breathing," uncluttered premium feel.

**Border radius scale:** Small (inputs, chips) → Medium (buttons, small cards) → Large (panels, modals) → Full/pill (primary buttons, badges) — nothing at zero/sharp across the entire user site.

**Shadow scale:** Levels from subtle ambient (resting cards) → medium (hover-lift) → pronounced glow (active/focused/rewarded elements) — all shadows tinted with brand color, never neutral grey.

**Glow levels:** Off (default inert state) → Idle (soft breathing pulse, primary CTAs) → Active (interaction feedback) → Celebratory (reward/achievement, most intense) — a defined 4-tier scale so glow intensity always communicates state.

**Animation speed tokens:** Micro (fastest, ~150–250ms) → Standard (~250–500ms) → Choreographed (~600ms–1.5s) → Celebration (slowest/most layered, 1.5–3s) — matching Section 7's duration bands.

**Typography scale:** A modular type scale from small (captions/metadata) through body, subheading, heading, up to display/hero sizes, with the handwritten/script category treated as a parallel special-purpose scale rather than part of the main hierarchy.

**Z-index strategy (conceptual layering, back to front):** Ambient background/environment → Scene content → Floating content (cards, polaroids) → Navigation/HUD chrome → Overlays (tooltips) → Modals/Dialogs → Celebration/reward overlays (always topmost) → System notices (unlock toasts).

---

## 17. Future Implementation Rules

**Always:**
- Always source colors, spacing, radius, shadow, and animation timing from this document's token system — never invent one-off values.
- Always motivate particle/animation choices narratively (Section 8 principle) — decoration must have a "why."
- Always provide a reduced-motion and muted-audio equivalent for every new animated/audio feature.
- Always keep games visually reskinned into the shared game-UI language (Section 10) — no bespoke per-game art direction that breaks universe consistency.
- Always treat gold as a reserved/earned color — never use it for routine UI.
- Always re-stage (not just shrink) scene composition per breakpoint.
- Always route personal content (photos, letters, quotes) through the photo/letter treatments defined here — never render them as plain unstyled media.

**Never:**
- Never use sharp/hard-edged UI elements anywhere on the user-facing site.
- Never use flat, neutral-grey shadows — shadows are always brand-color-tinted.
- Never let ambient particle density increase without a corresponding narrative/emotional justification (Section 6 mood curve).
- Never introduce a new font category outside the six defined in Section 3 without revisiting this document.
- Never use harsh, punitive game failure treatments (loud negative sounds, red error flashing) — failure stays gentle and encouraging.
- Never make sound or motion mandatory for progressing through content.
- Never let the Admin Dashboard sacrifice functional clarity for decorative flourish — restraint is intentional there.

**Consistency maintenance:** any new component, scene, or game proposed in a future prompt must be explicitly checked against Sections 2–4 and 16 (color, typography, component language, tokens) before being considered "on-brand." If a future prompt seems to require breaking one of these rules, that conflict must be raised and resolved explicitly rather than silently deviating.

---

## 18. Final Design Summary

**Design philosophy:** "The Journey To My Heart" is a fairytale built from real memories — a dreamlike, painterly fantasy world (Ghibli environments, Disney warmth, Apple-grade restraint) that stages genuine photos, letters, and moments as treasured artifacts rather than app content. Magic here is soft-spoken and earned, never loud or gimmicky.

**Emotional experience goal:** Take the visitor through a deliberate mood curve — curiosity → wonder → nostalgia → playfulness → intimacy → deep emotion → joyful celebration — with color temperature, particle density, and motion energy all rising and falling in service of that arc.

**Visual rules:** Rounded, soft-edged, glass-and-glow component language throughout; a disciplined color system where violet/rose/gold each carry distinct emotional weight (gold specifically reserved for earned/reward moments); typography split cleanly across six defined categories, each scoped to a specific emotional or functional purpose.

**Animation rules:** Everything floats, drifts, and settles rather than snapping; duration and easing scale with emotional significance (micro-interactions fast and light, celebration sequences slow and layered); tool selection (CSS/Framer Motion/GSAP/Three.js/Lottie) is matched to complexity and narrative weight, not used interchangeably.

**Component styling rules:** Every component — button, card, modal, game HUD element, admin table — draws from the same token system (Section 16), ensuring that whether a visitor is reading a love letter or the admin is uploading a photo, both experiences are unmistakably part of the same universe.

---

**Waiting for Prompt 3.**
