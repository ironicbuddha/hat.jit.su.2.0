# Context

## Product

Hatjitsu is a planning-poker application for lightweight collaborative
estimation. The current build is a Next.js rewrite intended to work in
Vercel-style, multi-instance environments without relying on in-memory process
state.

## Solved Architecture Direction

- App shell: Next.js App Router
- Deployment target: Vercel
- Shared state: Upstash Redis in deployed environments
- Local/test state: in-memory adapter
- Realtime: optional Ably notifications with polling fallback
- Identity: browser-stable anonymous participant identity
- Source of truth: shared backend room state, not transport connection state

## Core Domain Model

- Room: metadata, selected card pack, participant roster, active round
- Participant: anonymous identity plus room role such as voter or observer
- Round: one estimation pass with reveal state
- Vote: latest card chosen by a voter for the active round

Reset creates a fresh round while keeping room membership intact.

## Current Capabilities

### Room Lifecycle

- Users can create rooms and reopen them by routable identifier.
- Shared room state survives reloads and reconnects.
- Inactive rooms expire automatically via TTL-backed state.
- Room snapshots expose the planning state needed by the UI.

### Anonymous Participation

- Browsers can join without authentication.
- Participant identity persists across reconnects by room-scoped cookie.
- Observer and voter roles affect progress and vote handling.

### Planning Rounds

- Voters can cast and clear votes before reveal.
- Vote values stay hidden until explicit reveal, except that multi-voter rooms
  auto-reveal when every voter has voted.
- A solo voter does not auto-reveal their own vote.
- Hosts can reveal and reset rounds.
- Hosts can change card packs.

### Room Sync

- Mutations publish room-scoped update events through the realtime interface.
- Clients can recover from missed events by loading the latest snapshot.
- Polling is available even when managed realtime is not configured.

## Engineering Biases

- Keep business rules in server-side domain services.
- Keep route handlers and client components thin.
- Prefer explicit state transitions and testable contracts.
- Treat Redis as authoritative in deployed environments.
