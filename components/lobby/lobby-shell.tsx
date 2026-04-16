'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';

type CreateRoomResponse = {
  snapshot: {
    roomId: string;
  };
};

export function LobbyShell() {
  const router = useRouter();
  const [hostName, setHostName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinName, setJoinName] = useState('');
  const [submitting, setSubmitting] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createRoom() {
    setSubmitting('create');
    setError(null);

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ displayName: hostName }),
      });
      const data = (await response.json()) as CreateRoomResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'Could not create a room.');
      }

      startTransition(() => {
        router.push(`/room/${data.snapshot.roomId}`);
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not create a room.');
    } finally {
      setSubmitting(null);
    }
  }

  async function joinRoom() {
    const roomId = joinRoomId.trim();

    if (!roomId) {
      setError('Enter a room code to join.');
      return;
    }

    setSubmitting('join');
    setError(null);

    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ displayName: joinName }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'Could not join that room.');
      }

      startTransition(() => {
        router.push(`/room/${roomId}`);
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not join that room.');
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            padding: '1rem',
            border: '1px solid rgb(29 26 23 / 12%)',
            borderRadius: '24px',
            background: 'rgb(255 255 255 / 64%)',
          }}
        >
          <label htmlFor="host-name">Create a room</label>
          <input
            id="host-name"
            value={hostName}
            onChange={(event) => setHostName(event.target.value)}
            placeholder="Your display name"
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '999px',
              border: '1px solid rgb(29 26 23 / 18%)',
              background: 'white',
            }}
          />
          <button
            disabled={submitting !== null}
            onClick={createRoom}
            style={{
              padding: '0.9rem 1rem',
              borderRadius: '999px',
              border: 'none',
              background: '#d64f2a',
              color: 'white',
            }}
          >
            {submitting === 'create' ? 'Creating…' : 'Create room'}
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            padding: '1rem',
            border: '1px solid rgb(29 26 23 / 12%)',
            borderRadius: '24px',
            background: 'rgb(255 255 255 / 64%)',
          }}
        >
          <label htmlFor="room-id">Join an existing room</label>
          <input
            id="room-id"
            value={joinRoomId}
            onChange={(event) => setJoinRoomId(event.target.value)}
            placeholder="room_xxxxx"
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '999px',
              border: '1px solid rgb(29 26 23 / 18%)',
              background: 'white',
            }}
          />
          <input
            value={joinName}
            onChange={(event) => setJoinName(event.target.value)}
            placeholder="Your display name"
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '999px',
              border: '1px solid rgb(29 26 23 / 18%)',
              background: 'white',
            }}
          />
          <button
            disabled={submitting !== null}
            onClick={joinRoom}
            style={{
              padding: '0.9rem 1rem',
              borderRadius: '999px',
              border: '1px solid rgb(29 26 23 / 12%)',
              background: 'white',
            }}
          >
            {submitting === 'join' ? 'Joining…' : 'Join room'}
          </button>
        </div>
      </div>

      {error ? (
        <p style={{ marginTop: '1rem', color: '#a33114' }} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
