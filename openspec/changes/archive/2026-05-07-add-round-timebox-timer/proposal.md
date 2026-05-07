## Why

Remote estimation sessions need a lightweight way to timebox discussion without
moving attention away from the item being estimated. A shared countdown timer
keeps the room aligned while local audio cues help participants notice when the
timebox is ending, even when the meeting screen share is focused elsewhere.

## What Changes

- Add a host-controlled countdown timer for the active planning round.
- Display synchronized timer state to all joined room participants.
- Play participant-local audio cues for users whose browser has enabled sound:
  - final-10-second beeps
  - an end-of-timebox cue
- Preload timer audio when the room or join screen loads and provide an
  explicit sound enable/test control when browser autoplay rules require a user
  gesture.
- Reset timer state when the host resets the round.
- Defer custom uploaded ending sounds and shared ringtone management.

## Capabilities

### New Capabilities

### Modified Capabilities

- `planning-rounds`: Planning rounds can include a shared host-controlled
  timebox timer with participant-local audio cues.

## Impact

- Extends the room and round snapshot contract with timer state.
- Adds host timer mutation endpoints or equivalent room mutation workflows.
- Adds browser-side timer rendering, local ticking, and audio cue handling.
- Adds tests for timer state transitions, reset behavior, snapshot exposure, and
  audio-control UI behavior.
- Does not add a file-upload or blob-storage dependency in this change.
