import Ably from 'ably';

import type { RoomUpdateEvent } from '@/domain/rooms/types';
import { env } from '@/lib/env';

export interface RoomUpdatesPublisher {
  publish(event: RoomUpdateEvent): Promise<void>;
  status(): 'enabled' | 'disabled';
}

class DisabledRoomUpdatesPublisher implements RoomUpdatesPublisher {
  async publish(): Promise<void> {}

  status(): 'disabled' {
    return 'disabled';
  }
}

class AblyRoomUpdatesPublisher implements RoomUpdatesPublisher {
  constructor(private readonly client: Ably.Rest) {}

  async publish(event: RoomUpdateEvent): Promise<void> {
    await this.client.channels.get(`room:${event.roomId}`).publish(event.type, event);
  }

  status(): 'enabled' {
    return 'enabled';
  }
}

let publisher: RoomUpdatesPublisher | null = null;

export function getRoomUpdatesPublisher(): RoomUpdatesPublisher {
  if (publisher) {
    return publisher;
  }

  if (env.ABLY_API_KEY) {
    publisher = new AblyRoomUpdatesPublisher(new Ably.Rest({ key: env.ABLY_API_KEY }));
    return publisher;
  }

  publisher = new DisabledRoomUpdatesPublisher();
  return publisher;
}

export function resetRoomUpdatesPublisherForTests(): void {
  publisher = null;
}
