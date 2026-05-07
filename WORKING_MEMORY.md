# Working Memory

Last updated: 2026-05-07

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
  - self-visible unrevealed vote selection for the current voter
  - memory store for local/test and Upstash for deployment
  - Ably-backed publish interface with polling fallback on the client
  - three card packs:
    - Fibonacci
    - T-Shirt
    - Consecutive
  - host-controlled shared round timers with participant-local audio cues

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
  - selected-vote affordance and spec-sync changes
  - `next-env.d.ts`

## This Session

- Fixed the deployed Upstash room read path so Vercel no longer fails after
  room creation when Redis returns already-deserialized values.
- Added a regression test for the Upstash adapter deserialization behavior.
- Excluded `.env.example` from Vercel uploads with `.vercelignore` so the
  production build no longer warns about `.env` files.
- Added visible clipboard feedback for the room-link button:
  - `Copy room link` changes to `Copied room link` after a successful copy
  - the label resets automatically after a short delay
- Added Playwright coverage for the copy-link feedback flow.
- Added self-visible unrevealed vote selection in room snapshots so a voter can
  see and change their current choice until reveal.
- Added selected-card styling and guidance copy in the room voting UI.
- Added unit and Playwright coverage for the self-visible vote affordance.
- Synced the `planning-rounds` main spec with the self-visible unrevealed vote
  requirement and archived the completed OpenSpec change.
- Pushed and deployed the above changes to GitHub and Vercel.
- Ran verification for the deployed-fix and UX changes:
  - `pnpm test -- --run tests/unit/upstash-room-store.test.ts tests/unit/room-service.test.ts`
  - `pnpm typecheck`
  - `pnpm build`
  - `pnpm test:e2e -- tests/e2e/room-flow.spec.ts`
- Implemented the `add-round-timebox-timer` OpenSpec change:
  - added timer state to room snapshots
  - added host-only timer start and clear workflows
  - clears timer state on round reset and card-pack round replacement
  - added room UI for shared countdown display and host timer controls
  - added generated Web Audio beeps/end cue with sound enable/test fallback
  - added unit and Playwright coverage for timer behavior and sound affordances
- Ran verification for the timer change:
  - `openspec validate add-round-timebox-timer`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test`
  - `pnpm build`
  - `pnpm test:e2e -- tests/e2e/room-flow.spec.ts`

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

- Decide whether to keep or discard the generated `next-env.d.ts` dev import
  change, then commit it only if the repo should track that Next.js 16 update.
