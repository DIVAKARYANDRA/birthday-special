# features/games/

**Status:** placeholder — foundation only, no implementation yet (Prompt 7).

**Purpose:** Universal mini-game framework. `shared/` holds the GameShell contract and shared game chrome (HUD, timer, reward presentation) that every individual game plugs into. Each game subfolder implements only its own play logic (init/render/onComplete/getScore) — never its own chrome, scoring-submission, or reward presentation.

**Reference:** docs/05-frontend-architecture.md, Section 11; docs/01-system-architecture.md, Section 11
