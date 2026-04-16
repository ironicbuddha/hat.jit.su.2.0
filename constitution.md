# hat.jit.su.2.0 Constitution

This file defines how this repo is built, tested, secured, and shipped.

## Project Profile

- Project type: `web-app`
- Primary language: `TypeScript`
- Frontend stack: `Next.js`
- Backend shape: `route-handlers + server-side domain services`
- Package manager: `pnpm`
- Deployment target: `Vercel`
- Data sensitivity: `moderate`
- Runtime versions: `Node 22.x`

## Core Standards

### 1. Code And Dependency Standards

- TypeScript runs in strict mode.
- `pnpm` is the package manager.
- Public interfaces and non-obvious logic are documented.
- Shared business rules live in domain services, not in client components.
- Shared state adapters are explicit and swappable.

### 2. Testing Strategy

- Business logic gets unit tests.
- Critical collaborative flows get end-to-end coverage.
- Behavior changes ship with test updates.
- Lint, typecheck, test, and build stay green before changes are considered
  done.

### 3. Deployment And Release Standards

- Local development is documented and repeatable.
- Deployed multi-instance environments use Upstash Redis-backed room state.
- Preview and production deploys should be reproducible from committed config.
- Environment variables are documented without committing secrets.
- The release path is main-based until a different workflow is documented.

### 4. Security Standards

- Secrets live in 1Password or platform secret stores, never in Git.
- Request and config boundaries validate data explicitly.
- Anonymous participation is preserved, but authorization still applies to
  host-only actions such as reveal, reset, and card-pack changes.
- Logs must not leak tokens, secrets, or unnecessary sensitive data.

### 5. Observability And Operations

- Health checks exist for runtime verification.
- Production-critical failures should be visible through platform logs and
  error tracking when deployed.
- Room expiry behavior and realtime degradation should fail safely.

### 6. Documentation And AI Guidance

- `README.md` covers setup, verification, and deploy basics.
- `WORKING_MEMORY.md` tracks current repo state and open questions.
- `CONTEXT.md` tracks product and architecture reality.
- Repo-local agent guidance lives in `AGENTS.md`.

## Delivery Gates

Changes should not be considered complete unless these pass:

- lint
- typecheck
- test
- build
- end-to-end validation for changed collaborative flows when applicable

## Stack Addendum

### Next.js App

- Use App Router and keep route handlers thin.
- Keep server-only secrets and logic out of client bundles.
- Use polling as a safe baseline even when managed realtime is enabled.

### Shared Room State

- Local development and Playwright may use the memory adapter.
- Deployed multi-instance environments should use Upstash Redis.
- Redis-backed state is authoritative for active room snapshots.

### Realtime

- Managed realtime is a notification layer, not the source of truth.
- Clients must recover cleanly by fetching the latest room snapshot.

## Exceptions

If this repo deviates from these defaults, document:

- what differs
- why it differs
- what compensating control replaces the default

## Versioning

- Version: `0.1.0`
- Ratified: `2026-04-16`
- Last amended: `2026-04-16`
