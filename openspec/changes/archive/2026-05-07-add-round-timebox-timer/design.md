## Context

Hatjitsu currently treats shared room state as authoritative and uses realtime
events only as notifications that clients should refresh the latest room
snapshot. That model fits a timer if the server stores timer intent and
timestamps while each browser derives the visible countdown locally.

The timer is intended for remote estimation meetings where the meeting screen
share may show Jira, Linear, a document, or another work item rather than the
Hatjitsu room. Because of that, audio cues should play in each participant's
browser when enabled, not only in the host's browser.

Browsers commonly block audio playback until the user has interacted with the
page. The design must prepare audio early but still provide an explicit
enable/test path when autoplay restrictions apply.

## Goals / Non-Goals

**Goals:**

- Provide a shared host-controlled countdown timer for the active planning
  round.
- Keep timer state recoverable through room snapshots after reloads,
  reconnects, missed realtime events, or polling delays.
- Let all participants see the same countdown and hear cues locally when their
  browser has permitted sound.
- Make sound readiness visible and recoverable through a lightweight enable/test
  control.
- Stop or clear timer state when the host resets the round.

**Non-Goals:**

- Automatically reveal votes when a timer expires.
- Upload, persist, or share custom ending sounds.
- Guarantee audio playback on browsers that have not permitted sound.
- Add background server jobs to fire exactly when a timer reaches zero.
- Add long-term timer history or estimation analytics.

## Decisions

### Store timer timestamps in shared room state

The server will persist timer state with the active room or round, including the
configured duration, status, start time, and end time. Room snapshots will expose
that state to all joined participants.

Alternatives considered:

- Keep the timer client-only: rejected because reconnects and multi-participant
  views would drift.
- Run a server-side countdown job: rejected because Vercel-style deployments and
  the current architecture do not require exact server wakeups for a visual
  countdown.

### Derive countdown display locally from server timestamps

Clients will calculate remaining time from `endsAt` and the local clock, using
room refreshes to recover from missed events or stale state. Starting, stopping,
or resetting the timer remains a server mutation that increments the room
revision and publishes a room update.

Alternatives considered:

- Poll the server every second: rejected because it adds unnecessary load and
  does not improve correctness if the snapshot already includes `endsAt`.
- Trust realtime event timing for countdown ticks: rejected because realtime is
  a notification layer, not the source of truth.

### Play audio cues locally for participants who have armed sound

The app will preload timer audio assets when the room or join screen loads and
attempt to prepare playback. If playback is blocked, the UI will expose a sound
enable/test control. Participants who arm sound will hear final-10-second beeps
and an end cue locally.

Alternatives considered:

- Host-only audio: rejected because the host may not be sharing the Hatjitsu
  room or system audio during remote estimation.
- Force audio for all participants: rejected because browser autoplay policies
  make this impossible to guarantee.
- Spoken countdown: rejected in favor of simpler, less language-dependent beeps.

### Timer expiry does not mutate round reveal state

When the timer reaches zero, clients play the end cue and show an expired visual
state. Votes remain hidden until the existing auto-reveal or host reveal rules
apply.

Alternatives considered:

- Auto-reveal on expiry: rejected because the timer is for discussion timebox
  awareness, not a voting-state transition.

### Round reset clears timer state

Resetting the round will clear or stop the timer as part of creating the next
active round. This keeps the timer scoped to the estimation attempt it was set
for.

Alternatives considered:

- Preserve timer settings across reset: useful as a future convenience, but it
  risks accidentally carrying an expired or running timer into a fresh round.

## Risks / Trade-offs

- [Local clock drift can make displays differ slightly] -> Store authoritative
  start and end timestamps and refresh snapshots after mutations; accept small
  client display variance for an advisory timebox.
- [Browser audio may remain blocked] -> Preload assets, attempt preparation on
  load, and provide explicit enable/test controls tied to user gestures.
- [Multiple clients may beep a little out of phase] -> Use local derived time
  and avoid server jobs; the behavior is acceptable for advisory cues in remote
  meetings.
- [Timer state can conflict with round transitions] -> Treat reset as a timer
  clear and keep timer mutations in the same domain service that owns round
  state.

## Migration Plan

1. Extend the domain model, memory store, and Upstash serialization to tolerate
   timer state on active rooms or rounds.
2. Add server workflows for host timer start/stop/reset mutations and expose
   timer state in room snapshots.
3. Add room UI controls for hosts and countdown display for all participants.
4. Add client audio preparation, enable/test controls, final-10 beep playback,
   and end cue playback.
5. Add automated coverage for domain behavior and focused end-to-end coverage
   for the visible timer and sound-control affordance.

Rollback strategy:

- Because timer state is additive, rollback can ignore unknown timer fields in
  stored room data or clear active room state through normal TTL expiry.

## Open Questions

- Should the host be able to pause/resume, or is start/stop/reset sufficient for
  the first version?
- Which preset durations should be offered by default?
- Should sound-enabled preference be remembered globally or per room in browser
  storage?
