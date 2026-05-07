import { describe, expect, it } from 'vitest';

import { MemoryRoomStore, resetMemoryRoomStore } from '@/data/memory-room-store';
import { createRoomService, toRoomSnapshot } from '@/domain/rooms/service';
import type { RoomUpdateEvent } from '@/domain/rooms/types';

function createTestService(publishedEvents: RoomUpdateEvent[] = []) {
  resetMemoryRoomStore();

  return createRoomService({
    store: new MemoryRoomStore(),
    ttlSeconds: 3600,
    updates: {
      async publish(event) {
        publishedEvents.push(event);
      },
      status() {
        return 'disabled' as const;
      },
    },
  });
}

describe('RoomService', () => {
  it('creates rooms, joins participants, and restores the same browser identity', async () => {
    const service = createTestService();
    const created = await service.createRoom('Alice');
    const joined = await service.joinRoom({
      roomId: created.bundle.room.id,
      displayName: 'Bob',
      role: 'voter',
    });

    expect(joined.bundle.participants).toHaveLength(2);

    const rejoined = await service.joinRoom({
      roomId: created.bundle.room.id,
      participantId: joined.participantId,
      displayName: 'Ignored rename',
    });

    expect(rejoined.bundle.participants).toHaveLength(2);
    expect(rejoined.participantId).toBe(joined.participantId);
  });

  it('hides votes until reveal and excludes observers from completion counts', async () => {
    const service = createTestService();
    const created = await service.createRoom('Host');
    const guest = await service.joinRoom({
      roomId: created.bundle.room.id,
      displayName: 'Observer',
      role: 'observer',
    });

    const voted = await service.castVote(created.bundle.room.id, created.participantId, '5');
    const hiddenSnapshot = toRoomSnapshot(voted, created.participantId);

    expect(hiddenSnapshot.votesSubmitted).toBe(1);
    expect(hiddenSnapshot.voterCount).toBe(1);
    expect(hiddenSnapshot.participants[0]?.voteValue).toBe('5');

    const revealed = await service.reveal(created.bundle.room.id, created.participantId);
    const revealedSnapshot = toRoomSnapshot(revealed, guest.participantId);

    expect(revealedSnapshot.participants.find((participant) => participant.isHost)?.voteValue).toBe(
      '5',
    );
  });

  it('returns the current unrevealed vote only to the voter who cast it', async () => {
    const service = createTestService();
    const created = await service.createRoom('Alice');
    const joined = await service.joinRoom({
      roomId: created.bundle.room.id,
      displayName: 'Bob',
      role: 'voter',
    });

    const voted = await service.castVote(created.bundle.room.id, created.participantId, '5');
    const selfSnapshot = toRoomSnapshot(voted, created.participantId);
    const otherSnapshot = toRoomSnapshot(voted, joined.participantId);

    expect(
      selfSnapshot.participants.find((participant) => participant.id === created.participantId)
        ?.voteValue,
    ).toBe('5');
    expect(
      otherSnapshot.participants.find((participant) => participant.id === created.participantId)
        ?.voteValue,
    ).toBeNull();
  });

  it('resets rounds and clears votes when the host changes card packs', async () => {
    const service = createTestService();
    const created = await service.createRoom('Host');

    const voted = await service.castVote(created.bundle.room.id, created.participantId, '3');
    expect(voted.votes).toHaveLength(1);

    const changedPack = await service.changeCardPack(
      created.bundle.room.id,
      created.participantId,
      'tshirt',
    );

    expect(changedPack.room.cardPackId).toBe('tshirt');
    expect(changedPack.votes).toHaveLength(0);

    const reset = await service.reset(created.bundle.room.id, created.participantId);
    expect(reset.round.status).toBe('active');
    expect(reset.votes).toHaveLength(0);
  });

  it('does not auto-reveal when a single voter submits a vote', async () => {
    const service = createTestService();
    const created = await service.createRoom('Solo');

    const voted = await service.castVote(created.bundle.room.id, created.participantId, '5');
    const snapshot = toRoomSnapshot(voted, created.participantId);

    expect(snapshot.voterCount).toBe(1);
    expect(snapshot.votesSubmitted).toBe(1);
    expect(snapshot.revealed).toBe(false);
    expect(
      snapshot.participants.find((participant) => participant.isSelf)?.voteValue,
    ).toBe('5');
  });

  it('auto-reveals once all voters in a multi-voter room have voted', async () => {
    const service = createTestService();
    const created = await service.createRoom('Alice');
    const joined = await service.joinRoom({
      roomId: created.bundle.room.id,
      displayName: 'Bob',
      role: 'voter',
    });

    const firstVote = await service.castVote(created.bundle.room.id, created.participantId, '3');
    const hiddenSnapshot = toRoomSnapshot(firstVote, created.participantId);

    expect(hiddenSnapshot.revealed).toBe(false);
    expect(hiddenSnapshot.votesSubmitted).toBe(1);
    expect(hiddenSnapshot.voterCount).toBe(2);

    const secondVote = await service.castVote(created.bundle.room.id, joined.participantId, '5');
    const revealedSnapshot = toRoomSnapshot(secondVote, created.participantId);

    expect(revealedSnapshot.revealed).toBe(true);
    expect(revealedSnapshot.roundStatus).toBe('revealed');
    expect(
      revealedSnapshot.participants.find((participant) => participant.id === created.participantId)
        ?.voteValue,
    ).toBe('3');
    expect(
      revealedSnapshot.participants.find((participant) => participant.id === joined.participantId)
        ?.voteValue,
    ).toBe('5');
  });

  it('lets hosts start a shared round timer and exposes it in snapshots', async () => {
    const publishedEvents: RoomUpdateEvent[] = [];
    const service = createTestService(publishedEvents);
    const created = await service.createRoom('Host');

    const timed = await service.startTimer(
      created.bundle.room.id,
      created.participantId,
      300,
    );
    const snapshot = toRoomSnapshot(timed, created.participantId);

    expect(timed.round.timer?.durationSeconds).toBe(300);
    expect(snapshot.timer?.durationSeconds).toBe(300);
    expect(snapshot.timer?.status).toBe('running');
    expect(snapshot.timer?.startedAt).toEqual(timed.round.timer?.startedAt);
    expect(snapshot.timer?.endsAt).toEqual(timed.round.timer?.endsAt);
    expect(publishedEvents.some((event) => event.type === 'timer.started')).toBe(
      true,
    );
  });

  it('rejects non-host and invalid timer start requests', async () => {
    const service = createTestService();
    const created = await service.createRoom('Host');
    const joined = await service.joinRoom({
      roomId: created.bundle.room.id,
      displayName: 'Bob',
      role: 'voter',
    });

    await expect(
      service.startTimer(created.bundle.room.id, joined.participantId, 300),
    ).rejects.toThrow('Only the room host can perform this action.');
    await expect(
      service.startTimer(created.bundle.room.id, created.participantId, 5),
    ).rejects.toThrow('Timer duration must be between 10 seconds and 60 minutes.');
  });

  it('clears timer state when the host resets the round', async () => {
    const service = createTestService();
    const created = await service.createRoom('Host');

    const timed = await service.startTimer(
      created.bundle.room.id,
      created.participantId,
      300,
    );
    expect(toRoomSnapshot(timed, created.participantId).timer).not.toBeNull();

    const reset = await service.reset(created.bundle.room.id, created.participantId);

    expect(reset.round.timer).toBeNull();
    expect(toRoomSnapshot(reset, created.participantId).timer).toBeNull();
  });
});
