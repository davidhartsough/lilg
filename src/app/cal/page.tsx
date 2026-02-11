import LocalTime from "@/components/localtime";
import getEvents from "@/lib/gcal";
import styles from "./page.module.css";

export default async function CalPage() {
  const calEvents = await getEvents();
  return (
    <ul>
      {calEvents.map((ev) => (
        <li key={ev.id} className={styles.item}>
          <h2>{ev.title}</h2>
          <p>{ev.description}</p>
          <p>{ev.location}</p>
          <p>
            <LocalTime datetime={ev.start} /> - <LocalTime datetime={ev.end} />
          </p>
        </li>
      ))}
    </ul>
  );
}
