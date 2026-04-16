import { getRoomStore } from '@/data';
import { createRoomService } from '@/domain/rooms/service';
import { env } from '@/lib/env';
import { getRoomUpdatesPublisher } from '@/lib/realtime';

export function getRoomService() {
  return createRoomService({
    store: getRoomStore(),
    updates: getRoomUpdatesPublisher(),
    ttlSeconds: env.ROOM_TTL_SECONDS,
  });
}
