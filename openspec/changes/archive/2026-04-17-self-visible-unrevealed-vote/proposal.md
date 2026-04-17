## Why

Voters can already change their vote until the round reveals, but the current
room experience does not make that state legible. Once a voter selects a card,
the UI only reflects generic vote presence, which makes the interaction feel
one-shot even though it is still editable.

## What Changes

- Expose each voter's own current unrevealed vote back to that voter in room
  snapshots.
- Preserve hidden voting for everyone else until reveal or auto-reveal.
- Update the room UI so the selected card is visually distinct and the voting
  affordance makes mutability obvious.

## Capabilities

### Modified Capabilities

- `planning-rounds`: Voters can see their own current unrevealed selection
  while other participants continue to see only vote presence until reveal.

## Impact

- Extends the room snapshot contract with self-only unrevealed vote visibility.
- Clarifies the voting affordance without changing the existing round lock
  rules.
