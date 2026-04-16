## ADDED Requirements

### Requirement: Users can create a room
The system SHALL allow a user to create a new planning room and receive a unique room identifier that can be used to open the room page.

#### Scenario: Room is created from the lobby
- **WHEN** a user submits the create-room action from the lobby
- **THEN** the system creates a new room with an active round and returns a routable room identifier

### Requirement: Room state is shared across active sessions
The system SHALL store room configuration and round state in a shared backend accessible across application instances so that active room data survives process restarts, redeploys, and participant reconnects during the session lifetime.

#### Scenario: Room is reloaded after reconnect
- **WHEN** a participant reloads a valid room URL after the application instance has restarted
- **THEN** the system returns the most recent shared room snapshot for that room

### Requirement: Inactive rooms expire automatically
The system SHALL discard room state after a defined period of inactivity so disposable planning sessions do not persist indefinitely.

#### Scenario: Expired room is no longer available
- **WHEN** a participant opens a room after its inactivity TTL has elapsed
- **THEN** the system reports that the room is no longer available

### Requirement: Room snapshots expose current planning context
The system SHALL provide a room snapshot that includes room metadata, active round status, selected card pack, and visible participant state needed to render the room UI.

#### Scenario: Room page loads current snapshot
- **WHEN** a participant opens an existing room URL
- **THEN** the system returns a room snapshot containing the active round, participant roster, voter roles, and reveal state
