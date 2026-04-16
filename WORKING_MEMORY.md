# Working Memory

Last updated: 2026-04-16

## Repo Status

- The initial rewrite is implemented, verified, and archived.
- There is no active OpenSpec change in `openspec/changes/` right now.
- Main specs live under `openspec/specs/`.
- The app currently supports:
  - lobby create/join flow
  - room snapshot APIs
  - cookie-backed anonymous participant identity
  - voter and observer roles
  - vote, clear, reveal, reset, and card-pack flows
  - memory store for local/test and Upstash for deployment
  - Ably-backed publish interface with polling fallback on the client

## Current File Shape

- App shell and routes:
  - `app/`
- Client UI:
  - `components/lobby/`
  - `components/room/`
- Persistence:
  - `data/memory-room-store.ts`
  - `data/upstash-room-store.ts`
- Domain logic:
  - `domain/rooms/`
- Infra helpers:
  - `lib/env.ts`
  - `lib/realtime.ts`
  - `lib/room-cookies.ts`
- Tests:
  - `tests/unit/`
  - `tests/e2e/`

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`

## Open Questions

- Whether Ably should be required in deployed environments or remain optional.
- Whether host-only controls are enough, or whether moderation controls should
  be added.
- Whether opaque room IDs should be replaced with shorter human-friendly codes.

## Notes

- `ROOM_STORE_DRIVER=memory` is appropriate for local work and Playwright.
- Vercel or multi-instance deployment should use `ROOM_STORE_DRIVER=upstash`
  plus the Upstash credentials documented in `README.md`.
- Default repo lint scopes Markdown checks to the top-level authored context
  docs; OpenSpec artifacts remain excluded from `lint:md`.
- This directory is not currently a Git repo, so branch and commit workflow are
  not available from here.
