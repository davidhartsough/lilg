import { isLoggedIn } from "@/lib/session";
import styles from "./page.module.css";

export default async function Home() {
  const isSignedIn = await isLoggedIn();
  return (
    <main>
      <header className={styles.header}>
        <h1>lil' g</h1>
      </header>
      <section>
        <nav className={styles.nav}>
          {isSignedIn ? (
            <>
              <a href="/mail" className={styles.link}>
                Email
              </a>
              <a href="/cal" className={styles.link}>
                Calendar
              </a>
            </>
          ) : (
            <a
              className={`${styles.link} ${styles.google}`}
              href="/api/auth/login"
            >
              Sign in with Google
            </a>
          )}
        </nav>
      </section>
    </main>
  );
}
