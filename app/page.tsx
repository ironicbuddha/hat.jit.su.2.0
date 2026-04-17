import { LobbyShell } from '@/components/lobby/lobby-shell';

import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.shell}>
          <p className={styles.eyebrow}>Planning poker</p>
          <h1 className={styles.title}>Hatjitsu</h1>
          <p className={styles.lede}>
            Run a planning poker session with your team. Create a room and share
            the link — no accounts required.
          </p>
        </div>
      </section>
      <section className={styles.lobby}>
        <div className={styles.shell}>
          <LobbyShell />
        </div>
      </section>
    </main>
  );
}
