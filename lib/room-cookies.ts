import type { ParticipantId, RoomId } from '@/domain/rooms/types';

export function participantCookieName(roomId: RoomId): string {
  return `hatjitsu:${roomId}:participant`;
}

export function participantCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function serializeParticipantCookie(
  roomId: RoomId,
  participantId: ParticipantId,
) {
  return {
    name: participantCookieName(roomId),
    value: participantId,
    ...participantCookieOptions(),
  };
}
