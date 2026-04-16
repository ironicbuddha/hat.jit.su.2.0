import type {
  ParticipantRecord,
  RoomId,
  StoredRoomBundle,
} from '@/domain/rooms/types';

export type CreateRoomInput = {
  roomId: RoomId;
  host: ParticipantRecord;
  cardPackId: string;
  createdAt: string;
  expiresAt: string;
};

export interface RoomStore {
  createRoom(input: CreateRoomInput): Promise<StoredRoomBundle>;
  getRoom(roomId: RoomId): Promise<StoredRoomBundle | null>;
  saveRoom(bundle: StoredRoomBundle): Promise<StoredRoomBundle>;
}
