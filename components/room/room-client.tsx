'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useEffect, useEffectEvent, useMemo, useState } from 'react';

import type { RoomSnapshot } from '@/domain/rooms/types';
import { CARD_PACKS } from '@/shared/types/cards';

import styles from './room-client.module.css';

type LoadRoomResponse = {
  snapshot: RoomSnapshot;
  realtime: {
    provider: 'ably' | 'polling';
    key: string | null;
  };
};

type Props = {
  roomId: string;
};

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? 'Request failed.');
  }

  return data;
}

export function RoomClient({ roomId }: Props) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [realtime, setRealtime] = useState<LoadRoomResponse['realtime'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joinName, setJoinName] = useState('');
  const [profileName, setProfileName] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'live' | 'polling'>(
    'connecting',
  );

  const self = useMemo(
    () => snapshot?.participants.find((participant) => participant.isSelf) ?? null,
    [snapshot],
  );

  const isHost = Boolean(self?.isHost);
  const needsJoin = !self;
  const selectedVote = self?.voteValue ?? null;

  const refreshRoom = useEffectEvent(async () => {
    setLoading((current) => current && !snapshot);

    try {
      const data = await request<LoadRoomResponse>(`/api/rooms/${roomId}`);
      setSnapshot(data.snapshot);
      setRealtime(data.realtime);
      setProfileName((current) => {
        const selfName =
          data.snapshot.participants.find((participant) => participant.isSelf)?.displayName ?? '';

        return current || selfName;
      });
      setConnectionState(data.realtime.provider === 'ably' ? 'live' : 'polling');
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not load room.');
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    void refreshRoom();
  }, [roomId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshRoom();
    }, 4_000);

    return () => window.clearInterval(interval);
  }, [roomId, snapshot?.revision]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') {
        void refreshRoom();
      }
    }

    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [roomId]);

  useEffect(() => {
    const subscriptionKey = realtime?.key;

    if (!subscriptionKey || !snapshot) {
      return;
    }

    let disposed = false;

    async function subscribe() {
      try {
        const Ably = (await import('ably')).default;
        const client = new Ably.Realtime(subscriptionKey as string);
        const channel = client.channels.get(`room:${roomId}`);

        await channel.subscribe(() => {
          if (!disposed) {
            startTransition(() => {
              void refreshRoom();
            });
          }
        });

        return () => {
          disposed = true;
          void channel.detach();
          client.close();
        };
      } catch {
        setConnectionState('polling');
        return undefined;
      }
    }

    let cleanup: (() => void) | undefined;
    void subscribe().then((dispose) => {
      cleanup = dispose;
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [realtime?.key, roomId, snapshot]);

  useEffect(() => {
    if (!linkCopied) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setLinkCopied(false);
    }, 2_000);

    return () => window.clearTimeout(timeout);
  }, [linkCopied]);

  async function joinRoom(role: 'voter' | 'observer') {
    setAction('join');

    try {
      const data = await request<{ snapshot: RoomSnapshot }>(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        body: JSON.stringify({ displayName: joinName, role }),
      });
      setSnapshot(data.snapshot);
      setProfileName(
        data.snapshot.participants.find((participant) => participant.isSelf)?.displayName ?? '',
      );
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not join the room.');
    } finally {
      setAction(null);
    }
  }

  async function updateProfile(nextRole?: 'voter' | 'observer') {
    setAction('profile');

    try {
      const data = await request<{ snapshot: RoomSnapshot }>(
        `/api/rooms/${roomId}/participants/me`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            displayName: profileName,
            role: nextRole ?? self?.role,
          }),
        },
      );
      setSnapshot(data.snapshot);
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : 'Could not update profile.',
      );
    } finally {
      setAction(null);
    }
  }

  async function castVote(value: string) {
    setAction('vote');

    try {
      const data = await request<{ snapshot: RoomSnapshot }>(`/api/rooms/${roomId}/votes`, {
        method: 'POST',
        body: JSON.stringify({ value }),
      });
      setSnapshot(data.snapshot);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not cast vote.');
    } finally {
      setAction(null);
    }
  }

  async function clearVote() {
    setAction('clear');

    try {
      const data = await request<{ snapshot: RoomSnapshot }>(`/api/rooms/${roomId}/votes`, {
        method: 'DELETE',
      });
      setSnapshot(data.snapshot);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not clear vote.');
    } finally {
      setAction(null);
    }
  }

  async function reveal() {
    setAction('reveal');

    try {
      const data = await request<{ snapshot: RoomSnapshot }>(`/api/rooms/${roomId}/reveal`, {
        method: 'POST',
      });
      setSnapshot(data.snapshot);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not reveal round.');
    } finally {
      setAction(null);
    }
  }

  async function resetRound() {
    setAction('reset');

    try {
      const data = await request<{ snapshot: RoomSnapshot }>(`/api/rooms/${roomId}/reset`, {
        method: 'POST',
      });
      setSnapshot(data.snapshot);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not reset round.');
    } finally {
      setAction(null);
    }
  }

  async function copyRoomLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setError(null);
    } catch {
      setError('Could not copy the room link.');
    }
  }

  async function changeCardPack(cardPackId: string) {
    setAction('card-pack');

    try {
      const data = await request<{ snapshot: RoomSnapshot }>(
        `/api/rooms/${roomId}/card-pack`,
        {
          method: 'POST',
          body: JSON.stringify({ cardPackId }),
        },
      );
      setSnapshot(data.snapshot);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not change card pack.');
    } finally {
      setAction(null);
    }
  }

  if (loading && !snapshot) {
    return (
      <main className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Loading room</p>
          <h1 className={styles.title}>Syncing the current snapshot…</h1>
        </section>
      </main>
    );
  }

  if (!snapshot) {
    return (
      <main className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Room unavailable</p>
          <h1 className={styles.title}>This room could not be loaded.</h1>
          <p className={styles.lede}>{error ?? 'The room may have expired.'}</p>
          <button className={styles['button-ghost']} onClick={() => router.push('/')}>
            Back to lobby
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles['hero-header']}>
          <div>
            <p className={styles.eyebrow}>Collaborative room</p>
            <h1 className={styles.title}>{snapshot.roomId}</h1>
          </div>
          <button
            className={styles['button-ghost']}
            onClick={() => void copyRoomLink()}
            aria-live="polite"
          >
            {linkCopied ? 'Copied room link' : 'Copy room link'}
          </button>
        </div>
        <p className={styles.lede}>
          Shared room state is authoritative. This page refreshes on poll, on
          visibility changes, and on managed realtime events when Ably is configured.
        </p>
        <div className={styles['status-bar']}>
          <span className={styles.pill}>Revision {snapshot.revision}</span>
          <span className={styles.pill}>
            {snapshot.votesSubmitted}/{snapshot.voterCount} votes in
          </span>
          <span className={styles.pill}>Card pack: {snapshot.cardPackId}</span>
          <span className={styles.pill}>
            Connection: {connectionState === 'live' ? 'live updates' : 'polling'}
          </span>
        </div>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </section>

      {needsJoin ? (
        <section className={styles.card}>
          <h2 className={styles['section-title']}>Join this room</h2>
          <div className={styles['field-row']}>
            <label className={styles.label} htmlFor="join-name">
              Display name
            </label>
            <input
              id="join-name"
              className={styles.input}
              value={joinName}
              onChange={(event) => setJoinName(event.target.value)}
              placeholder="Guest"
            />
          </div>
          <div className={styles['button-row']}>
            <button
              className={styles.button}
              disabled={action !== null}
              onClick={() => void joinRoom('voter')}
            >
              {action === 'join' ? 'Joining…' : 'Join as voter'}
            </button>
            <button
              className={styles['button-ghost']}
              disabled={action !== null}
              onClick={() => void joinRoom('observer')}
            >
              Join as observer
            </button>
          </div>
        </section>
      ) : (
        <div className={styles.grid}>
          <section className={styles.card}>
            <h2 className={styles['section-title']}>Participants</h2>
            <div className={styles.participants}>
              {snapshot.participants.map((participant) => (
                <article className={styles.participant} key={participant.id}>
                  <div className={styles['participant-meta']}>
                    <span className={styles['participant-name']}>
                      {participant.displayName}
                      {participant.isSelf ? ' (you)' : ''}
                      {participant.isHost ? ' • host' : ''}
                    </span>
                    <span className={styles['participant-subtle']}>
                      {participant.role} · {participant.hasVoted ? 'vote in' : 'waiting'}
                    </span>
                  </div>
                  <span className={styles['vote-badge']}>
                    {snapshot.revealed
                      ? participant.voteValue ?? '—'
                      : participant.hasVoted
                        ? '•••'
                        : '—'}
                  </span>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.controls}>
            <section className={styles.card}>
              <h2 className={styles['section-title']}>Your profile</h2>
              <div className={styles['field-row']}>
                <label className={styles.label} htmlFor="profile-name">
                  Display name
                </label>
                <input
                  id="profile-name"
                  className={styles.input}
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                />
              </div>
              <div className={styles['button-row']}>
                <button
                  className={styles.button}
                  disabled={action !== null}
                  onClick={() => void updateProfile()}
                >
                  Save name
                </button>
                <button
                  className={styles['button-ghost']}
                  disabled={action !== null || self?.role === 'voter'}
                  onClick={() => void updateProfile('voter')}
                >
                  Become voter
                </button>
                <button
                  className={styles['button-ghost']}
                  disabled={action !== null || self?.role === 'observer'}
                  onClick={() => void updateProfile('observer')}
                >
                  Become observer
                </button>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles['section-title']}>Votes</h2>
              <p className={styles.hint}>
                Your current pick stays highlighted until the round reveals. Tap another card to
                change your vote.
              </p>
              <div className={styles['card-grid']}>
                {snapshot.availableCards.map((card) => (
                  <button
                    className={`${styles['card-button']} ${
                      snapshot.revealed
                        ? styles['card-button-inactive']
                        : selectedVote === card
                          ? styles['card-button-selected']
                        : styles['card-button-active']
                    }`}
                    aria-pressed={selectedVote === card}
                    disabled={action !== null || self?.role !== 'voter' || snapshot.revealed}
                    key={card}
                    onClick={() => void castVote(card)}
                  >
                    {card}
                  </button>
                ))}
              </div>
              <div className={styles['button-row']}>
                <button
                  className={styles['button-ghost']}
                  disabled={action !== null || self?.role !== 'voter' || snapshot.revealed}
                  onClick={() => void clearVote()}
                >
                  Clear vote
                </button>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles['section-title']}>Host controls</h2>
              <div className={styles['field-row']}>
                <label className={styles.label} htmlFor="card-pack">
                  Card pack
                </label>
                <select
                  id="card-pack"
                  className={styles.select}
                  disabled={!isHost || action !== null}
                  onChange={(event) => void changeCardPack(event.target.value)}
                  value={snapshot.cardPackId}
                >
                  {CARD_PACKS.map((pack) => (
                    <option key={pack.id} value={pack.id}>
                      {pack.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles['button-row']}>
                <button
                  className={styles.button}
                  disabled={!isHost || action !== null}
                  onClick={() => void reveal()}
                >
                  Reveal votes
                </button>
                <button
                  className={styles['button-ghost']}
                  disabled={!isHost || action !== null}
                  onClick={() => void resetRound()}
                >
                  Reset round
                </button>
              </div>
            </section>
          </section>
        </div>
      )}
    </main>
  );
}
