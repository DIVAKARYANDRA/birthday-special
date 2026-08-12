# env-templates/

This folder documents, per environment, which configuration categories
exist — it does not and must never contain real values. See:
- apps/web/.env.example
- apps/admin/.env.example
- services/api/.env.example

for the actual per-application variable templates (kept alongside each
app/service rather than centralized, so they stay in sync with what each
codebase actually reads).

Per docs/06-engineering-foundation.md, Section 2, three environments are
defined: local development, testing, and production. Each needs its own
populated (never committed) set of the values documented in the
`.env.example` files above — production is the only environment where real
Cloudinary/database/JWT secrets and real personal content coexist.
