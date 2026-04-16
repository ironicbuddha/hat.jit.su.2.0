import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { toRoomSnapshot } from '@/domain/rooms/service';
import { errorResponse } from '@/lib/api-errors';
import { participantCookieName, serializeParticipantCookie } from '@/lib/room-cookies';
import { getRoomService } from '@/lib/server-room-service';

type RouteContext = {
  params: Promise<{
    roomId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { roomId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      displayName?: string;
      role?: 'voter' | 'observer';
    };
    const cookieStore = await cookies();
    const existingParticipantId = cookieStore.get(participantCookieName(roomId))?.value;
    const service = getRoomService();
    const { bundle, participantId } = await service.joinRoom({
      roomId,
      participantId: existingParticipantId,
      displayName: body.displayName,
      role: body.role,
    });

    cookieStore.set(serializeParticipantCookie(roomId, participantId));

    return NextResponse.json({
      snapshot: toRoomSnapshot(bundle, participantId),
      participantId,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
