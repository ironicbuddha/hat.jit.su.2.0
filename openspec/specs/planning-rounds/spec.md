## Purpose

Planning rounds define how Hatjitsu rooms support estimation passes, including
voting, vote visibility, reveal/reset behavior, card packs, and shared
timeboxes.

## Requirements

### Requirement: Participants can cast and clear votes

The system SHALL allow each voter in the active round to cast a card value and later clear that vote before the round is revealed.

#### Scenario: Voter changes an unrevealed vote

- **WHEN** a voter submits a different card value before the round is revealed
- **THEN** the system stores the latest vote value for that voter in the active round

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

- **WHEN** at least one voter has not yet voted and the round has not been force-revealed
- **THEN** the system shows vote-presence state without exposing individual vote values to other participants

#### Scenario: Voter sees their own current unrevealed selection

- **WHEN** a voter has cast a vote and the round has not yet been revealed
- **THEN** the system returns that voter's current selected vote value in their own room snapshot
- **AND** the system continues to hide that unrevealed vote value from other participants

#### Scenario: Single voter does not auto-reveal

- **WHEN** a room has exactly one voter and that voter submits a vote
- **THEN** the round remains unrevealed and the system hides the submitted vote value from other participants until an explicit reveal action is performed

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

### Requirement: Hosts can run a shared round timer

The system SHALL allow the room host to configure and start a countdown timer
for the active planning round.

#### Scenario: Host starts a timer

- **WHEN** the room host starts a timer with a valid duration
- **THEN** the system stores the timer duration, start time, end time, and
  running status in shared room state
- **AND** the system returns the timer state in subsequent room snapshots

#### Scenario: Non-host cannot start a timer

- **WHEN** a participant who is not the room host attempts to start a timer
- **THEN** the system rejects the request as unauthorized

### Requirement: Participants see synchronized timer state

The system SHALL expose the shared timer state to all joined room participants
so each client can render the current countdown for the active round.

#### Scenario: Participant loads a room with a running timer

- **WHEN** a joined participant loads or refreshes a room while a timer is
  running
- **THEN** the room snapshot includes the timer end time and running status
- **AND** the client can derive the remaining time from that snapshot

#### Scenario: Timer expires without revealing votes

- **WHEN** the shared timer reaches its end time
- **THEN** the system keeps the current round reveal state unchanged
- **AND** votes remain hidden until existing reveal conditions are met

### Requirement: Timer reset follows round reset

The system SHALL clear active timer state when the host resets the planning
round.

#### Scenario: Host resets a round with a timer

- **WHEN** the room host resets the current round while a timer is running or
  expired
- **THEN** the system creates or activates a fresh round with no active timer
- **AND** subsequent room snapshots show no running or expired timer for that
  fresh round

### Requirement: Participants can enable timer sound cues

The system SHALL preload timer sound assets when the room or join screen loads
and SHALL provide participants an explicit way to enable and test sound cues
when browser playback is not already permitted.

#### Scenario: Browser permits sound preparation

- **WHEN** a participant opens the room or join screen and the browser permits
  timer sound preparation
- **THEN** the client prepares timer cue playback without requiring additional
  participant action

#### Scenario: Browser blocks automatic sound preparation

- **WHEN** a participant opens the room or join screen and the browser blocks
  automatic timer sound preparation
- **THEN** the client shows a sound enable or test control
- **AND** activating that control attempts to arm timer cue playback

### Requirement: Armed participants hear timer cues locally

The system SHALL play timer audio cues in each participant's browser when that
participant has enabled sound cues.

#### Scenario: Final ten seconds play beeps

- **WHEN** a shared timer is running and reaches the final ten seconds
- **THEN** each participant client with armed sound plays local countdown beeps

#### Scenario: Timer expiry plays end cue

- **WHEN** a shared timer reaches zero
- **THEN** each participant client with armed sound plays a local end-of-timebox
  cue

#### Scenario: Unarmed participant still sees timer

- **WHEN** a participant has not enabled sound cues
- **THEN** the participant still sees the shared timer countdown and expired
  state
- **AND** the client does not rely on audio playback for timer visibility
