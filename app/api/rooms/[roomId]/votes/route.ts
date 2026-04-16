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

async function getParticipantId(roomId: string): Promise<string | undefined> {
  return (await cookies()).get(participantCookieName(roomId))?.value;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { roomId } = await context.params;
    const participantId = await getParticipantId(roomId);

    if (!participantId) {
      return Response.json({ error: 'Join the room before voting.' }, { status: 401 });
    }

    const body = (await request.json()) as { value: string };
    const bundle = await getRoomService().castVote(roomId, participantId, body.value);

    return NextResponse.json({ snapshot: toRoomSnapshot(bundle, participantId) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { roomId } = await context.params;
    const participantId = await getParticipantId(roomId);

    if (!participantId) {
      return Response.json({ error: 'Join the room before clearing a vote.' }, { status: 401 });
    }

    const bundle = await getRoomService().clearVote(roomId, participantId);

    return NextResponse.json({ snapshot: toRoomSnapshot(bundle, participantId) });
  } catch (error) {
    return errorResponse(error);
  }
}
