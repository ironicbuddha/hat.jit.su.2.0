# Working Memory

Last updated: 2026-04-16

## Repo Status

- The initial rewrite is implemented, verified, and archived.
- The repo is now initialized as Git on branch `main`.
- The app is deployed on Vercel with Upstash Redis configured for deployed
  environments.
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
  - three card packs:
    - Fibonacci
    - T-Shirt
    - Consecutive

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

## Current Worktree

- Branch: `main`
- Modified, uncommitted files:
  - `README.md`
  - `next-env.d.ts`
  - `shared/types/cards.ts`

## This Session

- Provisioned Vercel project env vars for Upstash-backed deployment and
  redeployed production.
- Removed generated local `.env.local` and documented that deployed config
  belongs in Vercel env vars.
- Updated planning-round docs to match the implemented reveal behavior:
  - a solo voter does not auto-reveal
  - a multi-voter room auto-reveals when the final voter submits
- Added unit and Playwright coverage for that reveal behavior.
- Updated the card pack definitions:
  - added `conseq` / Consecutive
  - expanded Fibonacci to `0, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?`
- Ran verification after the card changes:
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm test:e2e`
  - `pnpm build`

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

## Next Action

- Review the three modified files, then commit and push the card-pack and
  README cleanup changes from `main`.
