## 1. Project Foundation

- [x] 1.1 Scaffold a Next.js App Router project configured for Vercel deployment
- [x] 1.2 Add core dependencies and tooling for TypeScript, linting, formatting, testing, and environment management
- [x] 1.3 Establish the application directory structure for app routes, components, domain services, data access, and shared types

## 2. Persistence and Domain Model

- [x] 2.1 Integrate Upstash Redis for room-level shared state with TTL support
- [x] 2.2 Implement the initial Redis-backed state model for rooms, participants, rounds, and votes
- [x] 2.3 Create server-side repositories and domain services for room snapshot assembly, expiry handling, and round state transitions

## 3. Room Lifecycle and Anonymous Participation

- [x] 3.1 Implement create-room and load-room server workflows backed by shared session state
- [x] 3.2 Implement browser-stable anonymous participant identity for room join and reconnect flows
- [x] 3.3 Implement participant role handling for voters and observers in room snapshots

## 4. Planning Round Mutations

- [x] 4.1 Implement cast-vote and clear-vote server workflows for the active round
- [x] 4.2 Implement reveal and reset round workflows using explicit round state transitions
- [x] 4.3 Implement card-pack selection and persistence for a room

## 5. Realtime Synchronization

- [x] 5.1 Integrate a managed realtime provider behind a local room-update interface
- [x] 5.2 Publish room-scoped update events after successful room mutations
- [x] 5.3 Implement client-side room synchronization that refreshes state safely after reconnects or missed events

## 6. User Interface

- [x] 6.1 Build the lobby route with create-room and join-room entry points
- [x] 6.2 Build the room route with participant roster, voting controls, reveal state, and admin actions
- [x] 6.3 Add connection, loading, and error handling states for collaborative room usage

## 7. Validation and Readiness

- [x] 7.1 Add automated tests for domain rules, shared-state workflows, and room snapshot behavior
- [x] 7.2 Add end-to-end tests covering create room, join room, vote, reveal, reset, and reconnect scenarios
- [x] 7.3 Verify Vercel deployment configuration and environment requirements for the shared session backend and realtime services
