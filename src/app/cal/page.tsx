import getEvents from "@/lib/gcal";
// import styles from "./page.module.css";

export default async function CalPage() {
  const calEvents = await getEvents();
  return (
    <ul>
      {calEvents.map((ev) => (
        <li key={ev.id}>
          <h2>Title: {ev.title}</h2>
          <p>Description: {ev.description}</p>
          <p>Location: {ev.location}</p>
          <p>Start: {ev.start}</p>
          <p>End: {ev.end}</p>
        </li>
      ))}
    </ul>
  );
}
