export class RoomNotFoundError extends Error {
  constructor(message = 'Room not found or expired.') {
    super(message);
    this.name = 'RoomNotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}
