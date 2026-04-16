## Context

The legacy Hatjitsu application combines server-rendered templates, a browser AngularJS client, and a Socket.IO server backed by in-memory room state. That model depends on a long-lived Node process, which is a poor fit for a Vercel-hosted application. The new application needs to preserve the core planning-poker workflow while moving to a Next.js architecture, shared ephemeral room state in Upstash Redis with expiry semantics, and room-scoped realtime updates that do not rely on process memory.

The new repository starts empty, so this change defines the first implementation foundation rather than a delta on top of an existing modern app. The target outcome is a Next.js app that can create rooms, support anonymous participants, run planning rounds, and remain correct through redeploys and reconnects while allowing inactive sessions to expire automatically.

## Goals / Non-Goals

**Goals:**

- Establish a Vercel-native architecture for room lifecycle, anonymous participation, planning rounds, and room updates.
- Use a shared ephemeral store as the source of truth for active rooms, rounds, participants, and votes.
- Preserve the no-login product experience while decoupling participant identity from transport-level socket sessions.
- Separate business rules from transport and UI concerns so core planning behavior can be tested independently.
- Define an implementation sequence that can reach functional parity in manageable slices.

**Non-Goals:**

- Full visual redesign or brand refresh.
- Account systems, invitations, billing, or user profiles.
- Historical analytics, archived room history, or long-term reporting.
- Self-hosted websocket infrastructure inside the Next.js deployment target.

## Decisions

### Use Next.js App Router as the application shell

The new app will use Next.js with App Router for routing, page composition, and deployment on Vercel. Lobby and room routes will be implemented as Next routes rather than Express handlers or template-rendered pages.

Alternatives considered:

- Continue with a custom Node server: rejected because it preserves the hosting mismatch.
- Use a different React meta-framework: rejected because Next.js has the clearest Vercel alignment for this project.

### Use Upstash Redis as the authoritative store for active rooms

Rooms, participants, rounds, and votes will be modeled in Upstash Redis using room-scoped keys and TTL refresh on activity. Shared session state in Redis is the source of truth for active rooms, and any room snapshot returned to clients will be derived from Redis rather than in-memory process state.

Alternatives considered:

- In-memory state with sticky routing: rejected because it does not survive deploys or scale safely.
- Durable relational persistence in Postgres: rejected for the initial design because planning sessions are disposable and do not require long-term retention.
- More complex stateful coordination systems: rejected for the initial design because the room model is simple enough for Redis-backed session state.

### Model estimation as rooms with explicit rounds

The domain model will separate persistent room metadata from per-round voting state. A room contains participants and configuration such as card pack. A round captures reveal state and the set of votes for one estimation pass. Resetting a room will create a fresh round rather than mutating all prior vote data in place.

Alternatives considered:

- Store one mutable room blob with embedded votes: rejected because it makes reset, history, and concurrency harder to reason about.
- Over-normalize every transient event: rejected because the initial system does not need event sourcing complexity.

### Represent each room as Redis-backed shared session data with an inactivity TTL

Each active room will be stored under room-scoped Redis keys that capture room metadata, active round state, participant state, and votes. Room TTL will be refreshed on create, join, and mutation activity. When TTL expires, the room is discarded without archival requirements.

Alternatives considered:

- Keep all room data in a single opaque serialized blob: acceptable for prototypes but rejected because it makes partial updates and inspections less clear.
- Use no TTL and rely on cleanup jobs: rejected because expiry is a core product assumption and should be enforced directly by the backend.

### Use browser-stable anonymous identity

Each browser will hold a stable anonymous client identifier in cookie or local storage. Server workflows will map that identifier to a participant record in a room. Realtime connection identifiers will not be used as the canonical participant identity.

Alternatives considered:

- Require login: rejected because it changes the product experience.
- Use connection IDs as identity: rejected because reconnects and platform changes would recreate participants and break continuity.

### Use managed realtime as a notification layer, not the source of truth

Room mutations will update Upstash Redis and then emit a room-scoped realtime event through a managed provider. Clients will treat these events as notifications to refresh or reconcile state, while Redis remains authoritative for the active session.

Alternatives considered:

- Self-host Socket.IO in the app: rejected because it reintroduces a stateful runtime mismatch on Vercel.
- Poll only: rejected because it degrades the collaborative room experience.

### Keep business rules in a domain service layer

Vote validation, reveal logic, observer handling, completion checks, and round reset behavior will live in server-side domain services independent of route handlers and UI components. UI and transport layers will call these services rather than duplicating planning logic.

Alternatives considered:

- Put all logic in API handlers: rejected because it makes testing and reuse harder.
- Put significant logic in client components: rejected because authoritative planning state must remain server controlled.

## Risks / Trade-offs

- [Managed realtime adds a platform dependency] -> Choose a provider with a simple room-channel model and wrap it behind a local interface so it can be swapped later.
- [Ephemeral state can disappear after expiry or backend eviction] -> Define clear room inactivity TTLs and surface room-expired handling in the UI.
- [Redis updates can race during concurrent participant actions] -> Use room-scoped mutation services that serialize critical transitions or apply atomic Redis operations for vote and reveal workflows.
- [Anonymous identity can still create duplicates across devices or cleared storage] -> Accept this as part of the no-login model and optimize for stable identity per browser rather than per human.
- [Next.js server actions versus route handlers may blur boundaries] -> Keep a clear service layer and reserve transport-specific code for thin adapters.
- [Feature parity work could expand into a full redesign] -> Sequence work around behavioral parity first and defer visual improvements.

## Migration Plan

1. Scaffold the Next.js application and core project tooling for Vercel deployment.
2. Introduce the Upstash Redis-backed session-state model and server-side access layer for rooms, rounds, participants, and votes.
3. Implement core room lifecycle and anonymous participation workflows.
4. Implement planning round mutations, expiry handling, and snapshot assembly logic.
5. Add room-scoped realtime notifications and reconnect-safe client synchronization.
6. Rebuild the lobby and room experiences on top of the new contracts.
7. Validate parity through automated tests and focused manual room workflows before cutover.

Rollback strategy:

- During development, no production rollback is required because the new app is being built in a separate repository.
- At cutover time, keep the legacy app available until the new app passes parity and deployment checks.

## Open Questions

- Which managed realtime provider should be the default integration for room updates and optional presence?
- Should room expiry be refreshed on every mutation, every page join, or through an explicit heartbeat strategy?
- Will anonymous participants set display names in the first slice, or should the initial implementation use generated identifiers only?
