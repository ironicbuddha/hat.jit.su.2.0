import { Redis } from '@upstash/redis';

import { MemoryRoomStore } from '@/data/memory-room-store';
import type { RoomStore } from '@/data/room-store';
import { UpstashRoomStore } from '@/data/upstash-room-store';
import { env } from '@/lib/env';

let roomStore: RoomStore | null = null;

export function getRoomStore(): RoomStore {
  if (roomStore) {
    return roomStore;
  }

  if (env.ROOM_STORE_DRIVER === 'upstash') {
    roomStore = new UpstashRoomStore(
      new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      }),
      env.ROOM_TTL_SECONDS,
    );

    return roomStore;
  }

  roomStore = new MemoryRoomStore();
  return roomStore;
}

export function resetRoomStoreForTests(): void {
  roomStore = null;
}
