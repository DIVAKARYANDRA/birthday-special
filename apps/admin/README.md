# apps/admin — Admin Dashboard

The content management system that controls everything shown on the User
Website, without any code changes, per the content-as-data principle
(docs/03-data-architecture.md). See:
- docs/04-backend-architecture.md, Section 3/5 for the Admin Content API
  and authorization model this app consumes
- docs/05-frontend-architecture.md, Section 3 for this app's internal
  architecture

## Status
Real, functional admin platform (Prompt 14) — login, protected routing, dashboard layout, and 7 content management screens (Media, Memories, Timeline, Letters, Quotes, Achievements, Unlock Conditions), all backed by real Admin Content APIs. See `docs/14-admin-platform-status.md` for the full record.

**Architecture:** `src/stores/authStore.ts` (Zustand — token state) → `src/hooks/useAuth.ts` (the only way feature code touches auth) → `src/api/client.ts` (base fetch client with 401-triggered silent refresh) → `src/api/*.ts` (one typed module per domain, most built on `src/api/resource.ts`'s generic CRUD factory) → `src/components/admin/ResourceListPage.tsx` (one generic list+create+archive screen, configured per domain in `src/modules/*/`).

**Not yet implemented:** design-system styling (inline styles only — "structure over polish," per Prompt 14, Part 6), the Letters domain's SecretMessage sub-screen, Achievement per-visitor progress visibility, the Unlock Condition composite AND/OR builder UI, and any screen for the domains still unimplemented on the backend (Games, Journey, Users management, Settings, etc.).

## Local setup (once dependencies are installed)
1. Copy `.env.example` to `.env.local` and fill in local values (`VITE_API_BASE_URL` should point at the running `services/api` backend).
2. Install dependencies with the package manager chosen for this project.
3. Run the dev script to start the local server (default port 5174, distinct
   from apps/web's 5173, so both can run simultaneously in local development).
