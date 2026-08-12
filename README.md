# The Journey To My Heart

A magical, interactive birthday adventure — an immersive storybook experience with a full no-code content management system behind it.

This repository is a **monorepo** containing two independent frontend applications and one backend service, coordinated around a single, fully data-driven experience. See `docs/` for the complete architectural foundation (Prompts 1–6) before making any implementation decision.

## Repository layout

```
journey-to-my-heart/
├── apps/
│   ├── web/         # User Website — the magical visitor-facing experience
│   └── admin/        # Admin Dashboard — the content management system (CMS)
├── services/
│   └── api/          # FastAPI backend — the single source of truth for content and progression
├── packages/
│   ├── ui-kit/        # Shared design tokens and primitive components
│   └── types/          # Shared TypeScript types (generated from the backend's API schema)
├── docs/              # The complete architectural reference — read this first
└── infra/             # Deployment configuration and environment templates
```

## Boundaries this repository enforces

- **`apps/web` and `apps/admin` never import from each other.** They are independently buildable and deployable applications that happen to share `packages/ui-kit` and `packages/types`.
- **Neither frontend ever talks to the database directly.** All data access goes through `services/api`'s HTTP API — this is a hard architectural boundary, not a convenience.
- **`services/api` owns all business logic**, including every unlock/gating decision (see `docs/04-backend-architecture.md`, Section 8). Frontend code never re-implements gating logic locally as anything more than a UX convenience.
- **The Admin experience is fully separate from the public User experience** — separate application, separate routing, separate authentication model (JWT admin sessions vs. lightweight visitor sessions).

## Getting started

This is the **foundation commit** — project scaffolding only, no business features yet. See `docs/06-engineering-foundation.md` for the full environment, configuration, and workflow strategy, and each app/service's own `README.md` for stack-specific setup notes once dependencies are installed locally.

## Status

Foundation established (Prompt 7). No business features, database models, API endpoints, authentication logic, or UI screens have been implemented yet — see each directory's `README.md` for what belongs there and what's intentionally still a placeholder.
