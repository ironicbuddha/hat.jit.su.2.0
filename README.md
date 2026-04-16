# hat.jit.su.2.0

Hatjitsu is a Next.js planning-poker application built for Vercel-style
deployment. It supports disposable planning rooms, anonymous participants,
shared room state, vote reveal/reset flows, and reconnect-safe room recovery.

## Current State

- Lobby and room flows are implemented.
- Shared room state supports two backends:
  - `memory` for local development and Playwright
  - `upstash` for deployed multi-instance environments
- Realtime fan-out is optional:
  - polling works by default
  - Ably can publish room update notifications when configured
- The initial rewrite change has been completed and archived.

## Product Scope

- Create a planning room
- Join a room without login
- Recover the same participant identity on reconnect
- Vote, clear votes, reveal, and reset rounds
- Switch card packs
- Keep room views synchronized after mutations

## Main Specs

- [openspec/specs/room-lifecycle/spec.md](/Users/carlo/dev/hat.jit.su.2.0/openspec/specs/room-lifecycle/spec.md)
- [openspec/specs/anonymous-participation/spec.md](/Users/carlo/dev/hat.jit.su.2.0/openspec/specs/anonymous-participation/spec.md)
- [openspec/specs/planning-rounds/spec.md](/Users/carlo/dev/hat.jit.su.2.0/openspec/specs/planning-rounds/spec.md)
- [openspec/specs/room-realtime-sync/spec.md](/Users/carlo/dev/hat.jit.su.2.0/openspec/specs/room-realtime-sync/spec.md)

## Local Development

1. Run `pnpm install`.
2. Start the app with `pnpm dev`.
3. Open `http://127.0.0.1:3000`.

Local development defaults to `ROOM_STORE_DRIVER=memory`.

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`

## Environment

Required for deployed multi-instance use:

- `ROOM_STORE_DRIVER=upstash`
- `ROOM_TTL_SECONDS`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Optional realtime:

- `ABLY_API_KEY`
- `NEXT_PUBLIC_ABLY_KEY`

## Key Docs

- [constitution.md](/Users/carlo/dev/hat.jit.su.2.0/constitution.md)
- [CONTEXT.md](/Users/carlo/dev/hat.jit.su.2.0/CONTEXT.md)
- [WORKING_MEMORY.md](/Users/carlo/dev/hat.jit.su.2.0/WORKING_MEMORY.md)
- [openspec/changes/archive/2026-04-16-nextjs-vercel-rewrite-foundation](/Users/carlo/dev/hat.jit.su.2.0/openspec/changes/archive/2026-04-16-nextjs-vercel-rewrite-foundation)
