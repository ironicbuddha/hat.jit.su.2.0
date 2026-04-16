## Why

Hatjitsu needs a modern foundation that can be deployed on Vercel without depending on a long-lived Node process or single-instance in-memory room state. Rebuilding the app as a Next.js application with shared ephemeral session state will preserve the core planning-poker workflow while making the product maintainable, deployable, and aligned with the disposable nature of planning sessions.

## What Changes

- Rebuild the application as a Next.js app designed for Vercel deployment.
- Replace single-process room state with shared ephemeral session storage that supports reconnects across Vercel instances.
- Introduce server-managed room, participant, round, and vote workflows that survive reconnects during an active session and expire after inactivity.
- Introduce room-scoped realtime synchronization suitable for a Vercel-hosted application.
- Preserve the no-login user experience with anonymous participant identity per browser.
- Define the initial implementation slices needed to reach feature parity for lobby, room participation, voting, reveal, and reset flows.

## Capabilities

### New Capabilities
- `room-lifecycle`: Create rooms, load room snapshots, and manage round state in Upstash Redis-backed session storage.
- `anonymous-participation`: Let browsers join rooms without account creation while preserving participant identity and role state across reconnects.
- `planning-rounds`: Support voting, vote hiding, reveal, reset, and card-pack selection for planning poker rounds.
- `room-realtime-sync`: Keep room views synchronized across participants after mutations in a Vercel-compatible architecture.

### Modified Capabilities

## Impact

- New application architecture based on Next.js App Router and Vercel deployment.
- New shared session-state dependency on Upstash Redis with TTL support for disposable planning rooms.
- New realtime integration for room-scoped updates and optional presence signals.
- Replacement of the legacy Express, EJS, AngularJS, and Socket.IO 0.9 runtime model.
- New test surface covering domain logic, API contracts, and end-to-end room behavior.
