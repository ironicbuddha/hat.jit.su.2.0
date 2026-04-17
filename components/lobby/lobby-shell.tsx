'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';

import styles from './lobby-shell.module.css';

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
      const data = (await response.json()) as CreateRoomResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? 'Could not create a room.');
      }

      startTransition(() => {
        router.push(`/room/${data.snapshot.roomId}`);
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not create a room.',
      );
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
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not join that room.',
      );
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div>
      <div className={styles.grid}>
        <div className={styles.panel}>
          <label className={styles['panel-label']} htmlFor="host-name">
            Create a room
          </label>
          <input
            className={styles.input}
            id="host-name"
            value={hostName}
            onChange={(event) => setHostName(event.target.value)}
            placeholder="Your display name"
          />
          <button
            className={styles['btn-primary']}
            disabled={submitting !== null}
            onClick={createRoom}
          >
            {submitting === 'create' ? 'Creating…' : 'Create room'}
          </button>
        </div>

        <div className={styles.panel}>
          <label className={styles['panel-label']} htmlFor="room-id">
            Join a room
          </label>
          <input
            className={styles.input}
            id="room-id"
            value={joinRoomId}
            onChange={(event) => setJoinRoomId(event.target.value)}
            placeholder="Room code"
          />
          <input
            className={styles.input}
            value={joinName}
            onChange={(event) => setJoinName(event.target.value)}
            placeholder="Your display name"
          />
          <button
            className={styles['btn-secondary']}
            disabled={submitting !== null}
            onClick={joinRoom}
          >
            {submitting === 'join' ? 'Joining…' : 'Join room'}
          </button>
        </div>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
