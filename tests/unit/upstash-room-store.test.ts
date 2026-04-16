import { describe, expect, it, vi } from 'vitest';

import { UpstashRoomStore } from '@/data/upstash-room-store';
import type { StoredRoomBundle } from '@/domain/rooms/types';

describe('UpstashRoomStore', () => {
  it('accepts mget values that are already deserialized by the SDK', async () => {
    const bundle: StoredRoomBundle = {
      room: {
        id: 'room_1',
        cardPackId: 'fibonacci',
        hostParticipantId: 'participant_1',
        createdAt: '2026-04-16T00:00:00.000Z',
        updatedAt: '2026-04-16T00:00:00.000Z',
        expiresAt: '2026-04-16T04:00:00.000Z',
      },
      participants: [
        {
          id: 'participant_1',
          displayName: 'Alice',
          role: 'voter',
          joinedAt: '2026-04-16T00:00:00.000Z',
          lastSeenAt: '2026-04-16T00:00:00.000Z',
        },
      ],
      round: {
        id: 'round_1',
        status: 'active',
        createdAt: '2026-04-16T00:00:00.000Z',
        revealedAt: null,
      },
      votes: [],
      revision: 1,
    };

    const redis = {
      mget: vi
        .fn()
        .mockResolvedValue([
          bundle.room,
          bundle.participants,
          bundle.round,
          bundle.votes,
          String(bundle.revision),
        ]),
    } as unknown as ConstructorParameters<typeof UpstashRoomStore>[0];

    const store = new UpstashRoomStore(redis, 3600);
    const result = await store.getRoom(bundle.room.id);

    expect(result).toEqual(bundle);
  });
});
