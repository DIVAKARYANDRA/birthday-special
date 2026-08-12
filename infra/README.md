# infra/

Deployment configuration and environment templates, per
docs/06-engineering-foundation.md, Section 15 (Deployment Strategy).

- `env-templates/` — documents which configuration values exist per
  environment (development / testing / production), with placeholder
  content only. Actual secret values are never stored here or anywhere in
  source control (Section 3).
- `ci/` — continuous integration pipeline configuration (build, lint, test
  gates per Section 8's Git workflow). Not yet configured — deferred until
  there is real code/tests to run in CI.

## Status
Foundation only (Prompt 7). No actual deployment configuration, hosting
setup, or CI pipeline is implemented yet — this directory currently
documents the intended shape only.
