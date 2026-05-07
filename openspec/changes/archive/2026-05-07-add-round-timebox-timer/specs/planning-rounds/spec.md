## ADDED Requirements

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
