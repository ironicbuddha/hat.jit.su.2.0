## ADDED Requirements

### Requirement: Participants can cast and clear votes

The system SHALL allow each voter in the active round to cast a card value and later clear that vote before the round is revealed.

#### Scenario: Voter changes an unrevealed vote

- **WHEN** a voter submits a different card value before the round is revealed
- **THEN** the system stores the latest vote value for that voter in the active round

### Requirement: Votes remain hidden until reveal conditions are met

The system SHALL hide individual vote values from participants until either:

- all voters in a multi-voter room have voted, or
- an explicit reveal action has been performed.

A single voter completing their own vote SHALL NOT auto-reveal the round.

#### Scenario: Partial voting keeps values hidden

- **WHEN** at least one voter has not yet voted and the round has not been force-revealed
- **THEN** the system shows vote-presence state without exposing individual vote values

#### Scenario: Single voter does not auto-reveal

- **WHEN** a room has exactly one voter and that voter submits a vote
- **THEN** the round remains unrevealed and the system hides the submitted vote value until an explicit reveal action is performed

#### Scenario: Multi-voter room auto-reveals after final vote

- **WHEN** a room has more than one voter and the final outstanding voter submits a vote
- **THEN** the system automatically marks the round as revealed and returns visible vote values for all submitted votes

### Requirement: Rounds can be force revealed

The system SHALL allow an authorized room participant to reveal the active round before all voters have voted.

#### Scenario: Force reveal exposes submitted votes

- **WHEN** a participant triggers the reveal action for the active round
- **THEN** the system marks the round as revealed and returns visible vote values for submitted votes

### Requirement: Rounds can be reset for another estimation pass

The system SHALL allow a room to start a fresh round after a reveal or unfinished attempt without losing room membership.

#### Scenario: Reset creates a fresh round

- **WHEN** a participant triggers the reset action for the current room
- **THEN** the system creates or activates a fresh round with no votes while preserving the room and participant roster

### Requirement: Rooms support selectable card packs

The system SHALL support multiple named card packs and SHALL apply the selected pack to the active room.

#### Scenario: Card pack selection updates room options

- **WHEN** a participant changes the card pack for a room
- **THEN** the system persists the selected card pack and returns that pack in subsequent room snapshots
