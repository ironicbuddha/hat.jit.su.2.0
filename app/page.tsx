import { LobbyShell } from '@/components/lobby/lobby-shell';

import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Bootstrap Foundation</p>
          <h1 className={styles.title}>Hatjitsu is ready for the real build.</h1>
          <p className={styles.lede}>
            Create a planning room, hand the link to your team, and keep the
            active round synchronized through shared room state. Anonymous
            browser identity and reconnect-safe session recovery are built into
            the flow.
          </p>
          <LobbyShell />
        </section>

        <section className={styles.grid}>
          <article className={styles.card}>
            <p className={styles.kicker}>Architecture</p>
            <h2>Server state stays authoritative</h2>
            <p>
              Rooms, participants, rounds, and votes live in shared session
              state with expiry. Realtime only tells clients when to refresh.
            </p>
          </article>

          <article className={styles.card}>
            <p className={styles.kicker}>Foundation</p>
            <h2>Tooling is wired early</h2>
            <p>
              TypeScript, ESLint, Prettier, Stylelint, Vitest, Playwright,
              environment validation, and deploy-ready route handlers are wired
              from the start.
            </p>
          </article>

          <article className={styles.card}>
            <p className={styles.kicker}>Execution</p>
            <h2>Domain slices come next</h2>
            <ul className={styles.list}>
              <li>Room lifecycle with TTL-backed expiry</li>
              <li>Anonymous participant recovery per browser</li>
              <li>Vote, reveal, reset, and card-pack flows</li>
              <li>Polling with optional Ably fan-out</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
