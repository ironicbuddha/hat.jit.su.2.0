import { AuthorizationError, RoomNotFoundError, ValidationError } from '@/domain/rooms/errors';

export function errorResponse(error: unknown): Response {
  console.error(error);

  if (error instanceof RoomNotFoundError) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof ValidationError) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof AuthorizationError) {
    return Response.json({ error: error.message }, { status: 403 });
  }

  return Response.json({ error: 'Unexpected server error.' }, { status: 500 });
}
