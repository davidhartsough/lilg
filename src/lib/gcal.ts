import "server-only";
import getAccessToken from "./tokens";

const calendarUrl =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

const _35Days = 35 * 24 * 60 * 60 * 1000;

export interface CalEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
}
interface GCalEventData {
  id: string;
  summary: string;
  description: string;
  location: string;
  status: string;
  start: {
    dateTime: string;
  };
  end: {
    dateTime: string;
  };
}

export default async function getEvents(): Promise<CalEvent[]> {
  const token = await getAccessToken();
  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + _35Days).toISOString();
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    maxResults: "60",
    singleEvents: "true",
    orderBy: "startTime",
    eventTypes: "default",
    fields: "items(id,summary,description,location,status,start,end)",
  }).toString();
  const res = await fetch(`${calendarUrl}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.error("Failed to fetch calendar events", res.status);
    return [];
  }
  const data = await res.json();
  const items: GCalEventData[] = data.items ?? [];
  const events: CalEvent[] = items
    .filter((e) => e.status !== "cancelled" && !!e.start.dateTime)
    .map(
      (e): CalEvent => ({
        id: e.id,
        title: e.summary ?? "(No title)",
        description: e.description ?? "",
        location: e.location ?? "",
        start: e.start?.dateTime ?? "",
        end: e.end?.dateTime ?? "",
      }),
    );
  return events;
}
