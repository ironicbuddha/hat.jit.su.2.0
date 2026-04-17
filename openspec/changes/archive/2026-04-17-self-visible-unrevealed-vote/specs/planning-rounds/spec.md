## MODIFIED Requirements

### Requirement: Votes remain hidden until reveal conditions are met

The system SHALL hide individual vote values from other participants until
either:

- all voters in a multi-voter room have voted, or
- an explicit reveal action has been performed.

A single voter completing their own vote SHALL NOT auto-reveal the round.
While the round remains unrevealed, the system SHALL return each voter's own
current selected vote value to that same voter so the client can show their
active selection without exposing it to other participants.

#### Scenario: Partial voting keeps values hidden from other participants

- **WHEN** at least one voter has not yet voted and the round has not been
  force-revealed
- **THEN** the system shows vote-presence state without exposing individual
  vote values to other participants

#### Scenario: Voter sees their own current unrevealed selection

- **WHEN** a voter has cast a vote and the round has not yet been revealed
- **THEN** the system returns that voter's current selected vote value in their
  own room snapshot
- **AND** the system continues to hide that unrevealed vote value from other
  participants

#### Scenario: Single voter does not auto-reveal

- **WHEN** a room has exactly one voter and that voter submits a vote
- **THEN** the round remains unrevealed and the system hides the submitted vote
  value from other participants until an explicit reveal action is performed

#### Scenario: Multi-voter room auto-reveals after final vote

- **WHEN** a room has more than one voter and the final outstanding voter
  submits a vote
- **THEN** the system automatically marks the round as revealed and returns
  visible vote values for all submitted votes
