import type { RoomStore } from '@/data/room-store';
import type { RoomUpdatesPublisher } from '@/lib/realtime';
import { nowIso, plusSeconds } from '@/lib/clock';
import { createId } from '@/lib/ids';
import { getCardPack, isCardPackId, type CardPackId } from '@/shared/types/cards';

import {
  AuthorizationError,
  RoomNotFoundError,
  ValidationError,
} from '@/domain/rooms/errors';
import {
  DEFAULT_CARD_PACK_ID,
  type ParticipantId,
  type ParticipantRecord,
  type ParticipantRole,
  type RoomSnapshot,
  type RoomSnapshotParticipant,
  type RoomUpdateEvent,
  type StoredRoomBundle,
} from '@/domain/rooms/types';

type RoomServiceDeps = {
  store: RoomStore;
  updates: RoomUpdatesPublisher;
  ttlSeconds: number;
};

export type JoinRoomInput = {
  roomId: string;
  participantId?: ParticipantId;
  displayName?: string;
  role?: ParticipantRole;
};

export type UpdateParticipantInput = {
  roomId: string;
  participantId: ParticipantId;
  displayName?: string;
  role?: ParticipantRole;
};

function cleanName(name: string | undefined, fallback: string): string {
  return (name?.trim() || fallback).slice(0, 32);
}

function assertHost(bundle: StoredRoomBundle, participantId: ParticipantId): void {
  if (bundle.room.hostParticipantId !== participantId) {
    throw new AuthorizationError('Only the room host can perform this action.');
  }
}

function nextRoomExpiry(ttlSeconds: number): string {
  return plusSeconds(new Date(), ttlSeconds);
}

function buildSnapshot(
  bundle: StoredRoomBundle,
  selfParticipantId?: ParticipantId,
): RoomSnapshot {
  const pack = getCardPack(bundle.room.cardPackId);
  const revealed = bundle.round.status === 'revealed';
  const voteMap = new Map(bundle.votes.map((vote) => [vote.participantId, vote.value]));
  const participants: RoomSnapshotParticipant[] = bundle.participants.map(
    (participant) => ({
      id: participant.id,
      displayName: participant.displayName,
      role: participant.role,
      isHost: participant.id === bundle.room.hostParticipantId,
      isSelf: participant.id === selfParticipantId,
      hasVoted: voteMap.has(participant.id),
      voteValue:
        revealed || participant.id === selfParticipantId
          ? voteMap.get(participant.id) ?? null
          : null,
    }),
  );

  const voters = participants.filter((participant) => participant.role === 'voter');
  const votesSubmitted = voters.filter((participant) => participant.hasVoted).length;

  return {
    roomId: bundle.room.id,
    cardPackId: bundle.room.cardPackId,
    roundId: bundle.round.id,
    roundStatus: bundle.round.status,
    revealed,
    revision: bundle.revision,
    createdAt: bundle.room.createdAt,
    updatedAt: bundle.room.updatedAt,
    expiresAt: bundle.room.expiresAt,
    participants,
    availableCards: pack.cards,
    revealEligible: votesSubmitted === voters.length && voters.length > 0,
    canReset: revealed || bundle.votes.length > 0,
    voterCount: voters.length,
    votesSubmitted,
  };
}

function voterCompletion(bundle: StoredRoomBundle) {
  const voters = bundle.participants.filter((participant) => participant.role === 'voter');
  const votesSubmitted = voters.filter((participant) =>
    bundle.votes.some((vote) => vote.participantId === participant.id),
  ).length;

  return {
    voters,
    votesSubmitted,
  };
}

async function publish(
  updates: RoomUpdatesPublisher,
  roomId: string,
  revision: number,
  type: RoomUpdateEvent['type'],
) {
  await updates.publish({
    roomId,
    revision,
    type,
    emittedAt: nowIso(),
  });
}

export class RoomService {
  constructor(private readonly deps: RoomServiceDeps) {}

  async createRoom(displayName?: string): Promise<{
    bundle: StoredRoomBundle;
    participantId: ParticipantId;
  }> {
    const now = new Date();
    const roomId = createId('room');
    const participantId = createId('participant');
    const createdAt = nowIso(now);
    const host: ParticipantRecord = {
      id: participantId,
      displayName: cleanName(displayName, 'Host'),
      role: 'voter',
      joinedAt: createdAt,
      lastSeenAt: createdAt,
    };

    const bundle = await this.deps.store.createRoom({
      roomId,
      host,
      cardPackId: DEFAULT_CARD_PACK_ID,
      createdAt,
      expiresAt: nextRoomExpiry(this.deps.ttlSeconds),
    });

    await publish(this.deps.updates, roomId, bundle.revision, 'room.created');
    return { bundle, participantId };
  }

  async getSnapshot(roomId: string, participantId?: string): Promise<RoomSnapshot> {
    const bundle = await this.deps.store.getRoom(roomId);

    if (!bundle) {
      throw new RoomNotFoundError();
    }

    return buildSnapshot(bundle, participantId);
  }

  async joinRoom(input: JoinRoomInput): Promise<{
    bundle: StoredRoomBundle;
    participantId: ParticipantId;
  }> {
    const bundle = await this.deps.store.getRoom(input.roomId);

    if (!bundle) {
      throw new RoomNotFoundError();
    }

    const existing = input.participantId
      ? bundle.participants.find((participant) => participant.id === input.participantId)
      : undefined;

    if (existing) {
      existing.lastSeenAt = nowIso();
      bundle.room.updatedAt = nowIso();
      bundle.room.expiresAt = nextRoomExpiry(this.deps.ttlSeconds);
      bundle.revision += 1;
      const saved = await this.deps.store.saveRoom(bundle);
      return { bundle: saved, participantId: existing.id };
    }

    const participantId = input.participantId ?? createId('participant');
    const now = nowIso();
    const participant: ParticipantRecord = {
      id: participantId,
      displayName: cleanName(input.displayName, 'Guest'),
      role: input.role ?? 'voter',
      joinedAt: now,
      lastSeenAt: now,
    };

    bundle.participants.push(participant);
    bundle.room.updatedAt = now;
    bundle.room.expiresAt = nextRoomExpiry(this.deps.ttlSeconds);
    bundle.revision += 1;

    const saved = await this.deps.store.saveRoom(bundle);
    await publish(this.deps.updates, input.roomId, saved.revision, 'participant.joined');
    return { bundle: saved, participantId };
  }

  async updateParticipant(input: UpdateParticipantInput): Promise<StoredRoomBundle> {
    const bundle = await this.deps.store.getRoom(input.roomId);

    if (!bundle) {
      throw new RoomNotFoundError();
    }

    const participant = bundle.participants.find(
      (candidate) => candidate.id === input.participantId,
    );

    if (!participant) {
      throw new AuthorizationError('Participant identity is missing for this room.');
    }

    if (input.displayName) {
      participant.displayName = cleanName(input.displayName, participant.displayName);
    }

    if (input.role) {
      participant.role = input.role;
      if (participant.role === 'observer') {
        bundle.votes = bundle.votes.filter((vote) => vote.participantId !== participant.id);
      }
    }

    participant.lastSeenAt = nowIso();
    bundle.room.updatedAt = nowIso();
    bundle.room.expiresAt = nextRoomExpiry(this.deps.ttlSeconds);
    bundle.revision += 1;

    const saved = await this.deps.store.saveRoom(bundle);
    await publish(this.deps.updates, input.roomId, saved.revision, 'participant.updated');
    return saved;
  }

  async castVote(roomId: string, participantId: ParticipantId, value: string) {
    const bundle = await this.deps.store.getRoom(roomId);

    if (!bundle) {
      throw new RoomNotFoundError();
    }

    if (bundle.round.status === 'revealed') {
      throw new ValidationError('The round has already been revealed.');
    }

    const participant = bundle.participants.find((candidate) => candidate.id === participantId);

    if (!participant) {
      throw new AuthorizationError('Participant identity is missing for this room.');
    }

    if (participant.role !== 'voter') {
      throw new ValidationError('Observers cannot cast votes.');
    }

    const pack = getCardPack(bundle.room.cardPackId);
    if (!pack.cards.includes(value)) {
      throw new ValidationError('Vote is not valid for the selected card pack.');
    }

    const existing = bundle.votes.find((vote) => vote.participantId === participantId);
    if (existing) {
      existing.value = value;
    } else {
      bundle.votes.push({ participantId, value });
    }

    const { voters, votesSubmitted } = voterCompletion(bundle);
    const shouldAutoReveal =
      bundle.round.status === 'active' &&
      voters.length > 1 &&
      votesSubmitted === voters.length;

    if (shouldAutoReveal) {
      bundle.round.status = 'revealed';
      bundle.round.revealedAt = nowIso();
    }

    participant.lastSeenAt = nowIso();
    bundle.room.updatedAt = nowIso();
    bundle.room.expiresAt = nextRoomExpiry(this.deps.ttlSeconds);
    bundle.revision += 1;

    const saved = await this.deps.store.saveRoom(bundle);
    await publish(this.deps.updates, roomId, saved.revision, 'vote.cast');
    if (shouldAutoReveal) {
      await publish(this.deps.updates, roomId, saved.revision, 'round.revealed');
    }
    return saved;
  }

  async clearVote(roomId: string, participantId: ParticipantId) {
    const bundle = await this.deps.store.getRoom(roomId);

    if (!bundle) {
      throw new RoomNotFoundError();
    }

    if (bundle.round.status === 'revealed') {
      throw new ValidationError('Votes cannot be cleared after reveal.');
    }

    bundle.votes = bundle.votes.filter((vote) => vote.participantId !== participantId);
    bundle.room.updatedAt = nowIso();
    bundle.room.expiresAt = nextRoomExpiry(this.deps.ttlSeconds);
    bundle.revision += 1;

    const saved = await this.deps.store.saveRoom(bundle);
    await publish(this.deps.updates, roomId, saved.revision, 'vote.cleared');
    return saved;
  }

  async reveal(roomId: string, participantId: ParticipantId) {
    const bundle = await this.deps.store.getRoom(roomId);

    if (!bundle) {
      throw new RoomNotFoundError();
    }

    assertHost(bundle, participantId);

    bundle.round.status = 'revealed';
    bundle.round.revealedAt = nowIso();
    bundle.room.updatedAt = nowIso();
    bundle.room.expiresAt = nextRoomExpiry(this.deps.ttlSeconds);
    bundle.revision += 1;

    const saved = await this.deps.store.saveRoom(bundle);
    await publish(this.deps.updates, roomId, saved.revision, 'round.revealed');
    return saved;
  }

  async reset(roomId: string, participantId: ParticipantId) {
    const bundle = await this.deps.store.getRoom(roomId);

    if (!bundle) {
      throw new RoomNotFoundError();
    }

    assertHost(bundle, participantId);

    bundle.round = {
      id: createId('round'),
      status: 'active',
      createdAt: nowIso(),
      revealedAt: null,
    };
    bundle.votes = [];
    bundle.room.updatedAt = nowIso();
    bundle.room.expiresAt = nextRoomExpiry(this.deps.ttlSeconds);
    bundle.revision += 1;

    const saved = await this.deps.store.saveRoom(bundle);
    await publish(this.deps.updates, roomId, saved.revision, 'round.reset');
    return saved;
  }

  async changeCardPack(
    roomId: string,
    participantId: ParticipantId,
    cardPackId: string,
  ) {
    const bundle = await this.deps.store.getRoom(roomId);

    if (!bundle) {
      throw new RoomNotFoundError();
    }

    assertHost(bundle, participantId);

    if (!isCardPackId(cardPackId)) {
      throw new ValidationError('Unknown card pack.');
    }

    bundle.room.cardPackId = cardPackId as CardPackId;
    bundle.votes = [];
    bundle.round = {
      id: createId('round'),
      status: 'active',
      createdAt: nowIso(),
      revealedAt: null,
    };
    bundle.room.updatedAt = nowIso();
    bundle.room.expiresAt = nextRoomExpiry(this.deps.ttlSeconds);
    bundle.revision += 1;

    const saved = await this.deps.store.saveRoom(bundle);
    await publish(this.deps.updates, roomId, saved.revision, 'card-pack.changed');
    return saved;
  }
}

export function createRoomService(deps: RoomServiceDeps): RoomService {
  return new RoomService(deps);
}

export function toRoomSnapshot(
  bundle: StoredRoomBundle,
  participantId?: ParticipantId,
): RoomSnapshot {
  return buildSnapshot(bundle, participantId);
}
