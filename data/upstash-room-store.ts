import { Redis } from '@upstash/redis';

import type { RoomStore, CreateRoomInput } from '@/data/room-store';
import type { StoredRoomBundle } from '@/domain/rooms/types';

function roomKeys(roomId: string) {
  return {
    room: `room:${roomId}:meta`,
    participants: `room:${roomId}:participants`,
    round: `room:${roomId}:round`,
    votes: `room:${roomId}:votes`,
    revision: `room:${roomId}:revision`,
  };
}

export class UpstashRoomStore implements RoomStore {
  constructor(
    private readonly redis: Redis,
    private readonly ttlSeconds: number,
  ) {}

  async createRoom(input: CreateRoomInput): Promise<StoredRoomBundle> {
    const bundle: StoredRoomBundle = {
      room: {
        id: input.roomId,
        cardPackId: input.cardPackId as StoredRoomBundle['room']['cardPackId'],
        hostParticipantId: input.host.id,
        createdAt: input.createdAt,
        updatedAt: input.createdAt,
        expiresAt: input.expiresAt,
      },
      participants: [input.host],
      round: {
        id: `round_${input.roomId}_1`,
        status: 'active',
        createdAt: input.createdAt,
        revealedAt: null,
      },
      votes: [],
      revision: 1,
    };

    await this.saveRoom(bundle);
    return bundle;
  }

  async getRoom(roomId: string): Promise<StoredRoomBundle | null> {
    const keys = roomKeys(roomId);
    const [room, participants, round, votes, revision] = await this.redis.mget<string[]>(
      keys.room,
      keys.participants,
      keys.round,
      keys.votes,
      keys.revision,
    );

    if (!room || !participants || !round || !votes || !revision) {
      return null;
    }

    return {
      room: JSON.parse(room) as StoredRoomBundle['room'],
      participants: JSON.parse(participants) as StoredRoomBundle['participants'],
      round: JSON.parse(round) as StoredRoomBundle['round'],
      votes: JSON.parse(votes) as StoredRoomBundle['votes'],
      revision: Number(revision),
    };
  }

  async saveRoom(bundle: StoredRoomBundle): Promise<StoredRoomBundle> {
    const keys = roomKeys(bundle.room.id);
    const pipeline = this.redis.pipeline();

    pipeline.set(keys.room, JSON.stringify(bundle.room), { ex: this.ttlSeconds });
    pipeline.set(keys.participants, JSON.stringify(bundle.participants), {
      ex: this.ttlSeconds,
    });
    pipeline.set(keys.round, JSON.stringify(bundle.round), {
      ex: this.ttlSeconds,
    });
    pipeline.set(keys.votes, JSON.stringify(bundle.votes), {
      ex: this.ttlSeconds,
    });
    pipeline.set(keys.revision, String(bundle.revision), { ex: this.ttlSeconds });

    await pipeline.exec();
    return bundle;
  }
}
