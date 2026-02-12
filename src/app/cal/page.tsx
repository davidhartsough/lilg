import LocalTime from "@/components/localtime";
import getEvents from "@/lib/gcal";

export default async function CalPage() {
  const calEvents = await getEvents();
  return (
    <ul>
      {calEvents.map((ev) => (
        <li key={ev.id}>
          <h2>{ev.title}</h2>
          <p className="smaller show-line-breaks">
            {ev.description
              .replace(/\n\s*\n+/g, "\n")
              .split("\n")
              .map((line) => line.replace(/[\p{Z}\p{Cf}\p{Cc}]+/gu, " ").trim())
              .join("\n")
              .replace(/ +/g, " ")}
          </p>
          <p>{ev.location}</p>
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
