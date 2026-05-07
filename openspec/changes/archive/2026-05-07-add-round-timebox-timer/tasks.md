## 1. Timer Domain Model

- [x] 1.1 Add timer state types to the room or active-round domain model
- [x] 1.2 Include timer state in room snapshot assembly
- [x] 1.3 Ensure memory and Upstash room stores preserve optional timer state

## 2. Timer Server Workflows

- [x] 2.1 Add host-only timer start workflow with duration validation
- [x] 2.2 Add host-only timer stop or clear workflow
- [x] 2.3 Clear timer state when the host resets the round
- [x] 2.4 Publish room update events after successful timer mutations

## 3. Room Timer UI

- [x] 3.1 Add host timer controls to the room view
- [x] 3.2 Display shared countdown and expired state to all joined participants
- [x] 3.3 Keep countdown rendering derived from snapshot timer timestamps

## 4. Audio Cue UX

- [x] 4.1 Add timer beep and end-cue audio assets or generated Web Audio cues
- [x] 4.2 Preload or prepare timer audio when the room or join screen loads
- [x] 4.3 Show a sound enable/test control when audio is not armed
- [x] 4.4 Play final-10-second beeps and end cue for participants with armed
      sound

## 5. Validation

- [x] 5.1 Add unit tests for timer start authorization, duration validation, and
      snapshot state
- [x] 5.2 Add unit tests for round reset clearing timer state
- [x] 5.3 Add end-to-end coverage for host timer controls and participant timer
      visibility
- [x] 5.4 Add focused UI coverage for the sound enable/test affordance
