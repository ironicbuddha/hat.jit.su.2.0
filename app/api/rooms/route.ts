import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { errorResponse } from '@/lib/api-errors';
import { serializeParticipantCookie } from '@/lib/room-cookies';
import { getRoomService } from '@/lib/server-room-service';
import { toRoomSnapshot } from '@/domain/rooms/service';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      displayName?: string;
    };
    const service = getRoomService();
    const { bundle, participantId } = await service.createRoom(body.displayName);
    const snapshot = toRoomSnapshot(bundle, participantId);

    (await cookies()).set(
      serializeParticipantCookie(bundle.room.id, participantId),
    );

    return NextResponse.json({ snapshot });
  } catch (error) {
    return errorResponse(error);
  }
}
