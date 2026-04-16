# Agent Guidance

Work from the actual repo state. This is no longer a bootstrap-only repo.

## Current Reality

- This directory is now a Git repo on branch `main`.
- The Next.js app, room APIs, and tests are implemented.
- There is no active OpenSpec change in `openspec/changes/`.
- The current source of truth for product requirements is `openspec/specs/`.

## Priority Sources

Read these first when orienting in the repo:

1. `README.md`
2. `WORKING_MEMORY.md`
3. `CONTEXT.md`
4. `constitution.md`
5. `openspec/specs/`

Read archived changes only when you need implementation history or design
context for past work.

## Working Rules

- Treat the main specs in `openspec/specs/` as the current product contract.
- Keep server state authoritative; realtime is a notification layer.
- Preserve the distinction between local memory mode and deployed Redis mode.
- Do not describe the repo as unscaffolded or pre-implementation.
- Update `WORKING_MEMORY.md` when repo state materially changes.

## Expected Stack

- TypeScript
- Next.js App Router
- Vercel
- Upstash Redis
- Optional Ably notifications
- Anonymous browser-stable participant identity

## Documentation Hygiene

- Keep `README.md` user-facing and current.
- Keep `WORKING_MEMORY.md` focused on implemented state and near-term gaps.
- Keep `CONTEXT.md` focused on architecture and domain reality.
- Keep `constitution.md` aligned with actual repo conventions.
