import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { toRoomSnapshot } from '@/domain/rooms/service';
import { errorResponse } from '@/lib/api-errors';
import { participantCookieName } from '@/lib/room-cookies';
import { getRoomService } from '@/lib/server-room-service';

type RouteContext = {
  params: Promise<{
    roomId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { roomId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      displayName?: string;
      role?: 'voter' | 'observer';
    };
    const participantId = (await cookies()).get(participantCookieName(roomId))?.value;

    if (!participantId) {
      return Response.json(
        { error: 'Join the room before changing participant settings.' },
        { status: 401 },
      );
    }

    const bundle = await getRoomService().updateParticipant({
      roomId,
      participantId,
      displayName: body.displayName,
      role: body.role,
    });

    return NextResponse.json({ snapshot: toRoomSnapshot(bundle, participantId) });
  } catch (error) {
    return errorResponse(error);
  }
}
