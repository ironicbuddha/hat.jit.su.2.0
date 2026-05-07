import type { CardPackId } from '@/shared/types/cards';

export type RoomId = string;
export type ParticipantId = string;
export type RoundId = string;
export type ParticipantRole = 'voter' | 'observer';
export type RoundStatus = 'active' | 'revealed';
export type RoundTimerStatus = 'running' | 'expired';
export type VoteValue = string;

export const DEFAULT_CARD_PACK_ID: CardPackId = 'fibonacci';

export type RoomRecord = {
  id: RoomId;
  cardPackId: CardPackId;
  hostParticipantId: ParticipantId;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

export type ParticipantRecord = {
  id: ParticipantId;
  displayName: string;
  role: ParticipantRole;
  joinedAt: string;
  lastSeenAt: string;
};

export type RoundRecord = {
  id: RoundId;
  status: RoundStatus;
  createdAt: string;
  revealedAt: string | null;
  timer?: RoundTimerRecord | null;
};

export type RoundTimerRecord = {
  durationSeconds: number;
  startedAt: string;
  endsAt: string;
};

export type VoteRecord = {
  participantId: ParticipantId;
  value: VoteValue;
};

export type StoredRoomBundle = {
  room: RoomRecord;
  participants: ParticipantRecord[];
  round: RoundRecord;
  votes: VoteRecord[];
  revision: number;
};

export type RoomSnapshotParticipant = {
  id: ParticipantId;
  displayName: string;
  role: ParticipantRole;
  isHost: boolean;
  isSelf: boolean;
  hasVoted: boolean;
  voteValue: VoteValue | null;
};

export type RoomSnapshot = {
  roomId: RoomId;
  cardPackId: CardPackId;
  roundId: RoundId;
  roundStatus: RoundStatus;
  revealed: boolean;
  revision: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  participants: RoomSnapshotParticipant[];
  availableCards: string[];
  revealEligible: boolean;
  canReset: boolean;
  voterCount: number;
  votesSubmitted: number;
  timer: RoundTimerSnapshot | null;
};

export type RoundTimerSnapshot = RoundTimerRecord & {
  status: RoundTimerStatus;
};

export type RoomUpdateEvent = {
  roomId: RoomId;
  revision: number;
  type:
    | 'room.created'
    | 'participant.joined'
    | 'participant.updated'
    | 'vote.cast'
    | 'vote.cleared'
    | 'round.revealed'
    | 'round.reset'
    | 'card-pack.changed'
    | 'timer.started'
    | 'timer.cleared';
  emittedAt: string;
};
