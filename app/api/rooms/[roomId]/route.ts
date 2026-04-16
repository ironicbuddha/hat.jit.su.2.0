import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { errorResponse } from '@/lib/api-errors';
import { participantCookieName } from '@/lib/room-cookies';
import { getRoomService } from '@/lib/server-room-service';

type RouteContext = {
  params: Promise<{
    roomId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { roomId } = await context.params;
    const cookieStore = await cookies();
    const participantId = cookieStore.get(participantCookieName(roomId))?.value;
    const snapshot = await getRoomService().getSnapshot(roomId, participantId);

    return NextResponse.json({
      snapshot,
      realtime: {
        provider: process.env.NEXT_PUBLIC_ABLY_KEY ? 'ably' : 'polling',
        key: process.env.NEXT_PUBLIC_ABLY_KEY ?? null,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
