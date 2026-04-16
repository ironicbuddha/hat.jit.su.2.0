import { describe, expect, it } from 'vitest';

describe('foundation scaffold', () => {
  it('exposes the planned room runtime surface', async () => {
    const roomTypes = await import('@/domain/rooms/types');

    expect(roomTypes.DEFAULT_CARD_PACK_ID).toBe('fibonacci');
  });
});
