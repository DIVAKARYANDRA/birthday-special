# packages/ui-kit

Shared design tokens and primitive UI components, per
docs/05-frontend-architecture.md, Section 5 and
docs/06-engineering-foundation.md, Section 1.

Consumed by both `apps/web` and `apps/admin` — this is one of the ONLY two
things the two frontend applications share (the other is `packages/types`).
Neither app's feature code is shared here.

## Status
Foundation only (Prompt 7). Folder structure established
(`src/tokens/`, `src/primitives/`); no actual tokens or components are
implemented yet.
