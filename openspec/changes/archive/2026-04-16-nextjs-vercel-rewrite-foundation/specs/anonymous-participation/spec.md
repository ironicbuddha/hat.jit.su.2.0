## ADDED Requirements

### Requirement: Participants can join without an account
The system SHALL allow a browser to participate in a room without requiring account creation or authentication.

#### Scenario: First-time browser joins a room
- **WHEN** a browser with no existing participant identity opens a valid room
- **THEN** the system creates an anonymous participant identity and associates it with that browser for the room

### Requirement: Participant identity persists across reconnects
The system SHALL preserve a browser's participant identity across page reloads and reconnects so that the same participant can continue the session without creating duplicates by default.

#### Scenario: Returning browser rejoins the same room
- **WHEN** a browser with an existing participant identity reconnects to the same room
- **THEN** the system restores the participant's existing identity and role state for that room

### Requirement: Participants can be voters or observers
The system SHALL support participant role state that distinguishes voters from observers and SHALL use that role state when evaluating room progress.

#### Scenario: Observer is excluded from voting completion
- **WHEN** a participant is marked as an observer in a room
- **THEN** the system excludes that participant from voter counts and vote completion calculations
