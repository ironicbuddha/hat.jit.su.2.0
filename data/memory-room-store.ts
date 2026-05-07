import type { RoomStore, CreateRoomInput } from '@/data/room-store';
import type { StoredRoomBundle } from '@/domain/rooms/types';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const memoryStore = new Map<string, StoredRoomBundle>();

export class MemoryRoomStore implements RoomStore {
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
        timer: null,
      },
      votes: [],
      revision: 1,
    };

    memoryStore.set(input.roomId, clone(bundle));
    return clone(bundle);
  }

  async getRoom(roomId: string): Promise<StoredRoomBundle | null> {
    const bundle = memoryStore.get(roomId);

    if (!bundle) {
      return null;
    }

    if (Date.parse(bundle.room.expiresAt) <= Date.now()) {
      memoryStore.delete(roomId);
      return null;
    }

    return clone(bundle);
  }

  async saveRoom(bundle: StoredRoomBundle): Promise<StoredRoomBundle> {
    memoryStore.set(bundle.room.id, clone(bundle));
    return clone(bundle);
  }
}

export function resetMemoryRoomStore(): void {
  memoryStore.clear();
}
