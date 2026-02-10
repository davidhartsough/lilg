import Link from "next/link";
import { isLoggedIn } from "@/lib/session";
import styles from "./page.module.css";

export default async function Home() {
  const isSignedIn = await isLoggedIn();
  return (
    <main>
      <header>
        <h1>lil' g</h1>
      </header>
      <section>
        {isSignedIn ? (
          <nav className={styles.nav}>
            <ul className={styles.links}>
              <li>
                <Link href="/mail">Email</Link>
              </li>
              <li>
                <Link href="/cal">Calendar</Link>
              </li>
            </ul>
          </nav>
        ) : (
          <div className={styles.login}>
            <a className={styles.google} href="/api/auth/login">
              Sign in with Google
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
