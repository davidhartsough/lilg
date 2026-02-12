import LocalTime from "@/components/localtime";
import getEvents from "@/lib/gcal";

export default async function CalPage() {
  const calEvents = await getEvents();
  return (
    <ul>
      {calEvents.map((ev) => (
        <li key={ev.id}>
          <h2>{ev.title}</h2>
          {ev.description && (
            <p className="smaller show-line-breaks">
              {ev.description
                .replace(/[^\p{L}\p{N}\p{P}\p{S}\n\x20]+/gu, " ")
                .replace(/\n+/g, "\n")
                .replace(/ +/g, " ")}
            </p>
          )}
          {ev.location && <p>{ev.location}</p>}
          <p>
            <LocalTime datetime={ev.start} />
            <span> &ndash; </span>
            <LocalTime datetime={ev.end} timeOnly />
          </p>
        </li>
      ))}
    </ul>
  );
}
