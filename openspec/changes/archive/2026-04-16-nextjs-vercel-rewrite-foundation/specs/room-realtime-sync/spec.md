## ADDED Requirements

### Requirement: Room mutations notify connected participants
The system SHALL publish room-scoped update events after successful room mutations so connected participants can refresh or reconcile their local view.

#### Scenario: Vote mutation emits room update
- **WHEN** a vote is successfully cast, cleared, revealed, reset, or a card pack is changed
- **THEN** the system publishes a room-scoped update event for connected participants in that room

### Requirement: Realtime delivery does not replace shared session state
The system SHALL treat the shared room backend as the source of truth and SHALL ensure clients can recover the current room snapshot after missed or dropped realtime events.

#### Scenario: Client catches up after missed event
- **WHEN** a participant reconnects after missing one or more room update events
- **THEN** the system can provide the latest room snapshot from shared session state without requiring replay of every missed event

### Requirement: Realtime updates are room scoped
The system SHALL isolate room update delivery so participants only receive events for rooms they have joined.

#### Scenario: Participant does not receive unrelated room updates
- **WHEN** a mutation occurs in a different room
- **THEN** the system does not deliver that room's update event to participants outside the room
