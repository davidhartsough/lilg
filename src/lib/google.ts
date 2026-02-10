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

export async function getEvents(): Promise<CalEvent[]> {
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
  const items = data.items ?? [];
  const events: CalEvent[] = items
    .filter((e: any) => e.status !== "cancelled" && !!e.start.dateTime)
    .map(
      (e: any): CalEvent => ({
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

interface Message {
  id: string;
  threadId: string;
  // snippet: string;
  // internalDate: string;
}
interface Thread {
  id: string;
  snippet: string;
}
// messages: {id threadId};
// messageCount: number;
// date: string;
// subject: string;
// from: string;

const gmailUrl = "https://gmail.googleapis.com/gmail/v1/users/me/";
const threadsUrl = `${gmailUrl}threads`;
const messagesUrl = `${gmailUrl}messages`;
const params = new URLSearchParams({
  maxResults: "40",
  includeSpamTrash: "false",
  labelIds: "INBOX",
  q: "in:inbox newer_than:35d category:primary",
}).toString();

// threads[] each = id and snippet
async function getThreads(headers: RequestInit): Promise<Thread[]> {
  const res = await fetch(`${threadsUrl}?${params}`, headers);
  if (!res.ok) {
    console.error("Failed to fetch threads", res.status);
    return [];
  }
  const data = await res.json();
  return data.threads ?? [];
}

// messages[] each = id and threadId
async function getMessages(headers: RequestInit): Promise<Message[]> {
  const res = await fetch(`${messagesUrl}?${params}`, headers);
  // const res = await fetch(`${gmailUrl}threads/${threadId}/messages`, headers);
  if (!res.ok) {
    console.error("Failed to fetch messages", res.status);
    return [];
  }
  const data = await res.json();
  return data.messages ?? [];
}

const metadataParams = new URLSearchParams({
  format: "metadata",
  metadataHeaders: "Subject",
});
metadataParams.append("metadataHeaders", "From");
metadataParams.append("metadataHeaders", "Date");
const metadataQuery = metadataParams.toString();

// email message IDs and email headers
async function getThread(threadId: string, headers: RequestInit) {
  const res = await fetch(
    `${threadsUrl}/${threadId}?${metadataQuery}`,
    headers,
  );
  if (!res.ok) {
    console.error("Failed to fetch thread", res.status);
    return [];
  }
  const data = await res.json();
  return data;
}
async function getMessage(messageId: string, headers: RequestInit) {
  const res = await fetch(
    `${messagesUrl}/${messageId}?${metadataQuery}`,
    headers,
  );
  if (!res.ok) {
    console.error("Failed to fetch message", res.status);
    return [];
  }
  const data = await res.json();
  return data;
}

export async function getMail() {
  console.time("getMail");
  const token = await getAccessToken();
  const headers = { headers: { Authorization: `Bearer ${token}` } };
  console.timeLog("getMail", "got token");
  const threads = await getThreads(headers);
  console.timeLog("getMail", "got threads");
  const messages = await getMessages(headers);
  console.timeLog("getMail", "got messages");
  const threadPromises = threads.map(({ id }) => getThread(id, headers));
  const threadsData = await Promise.all(threadPromises);
  console.timeLog("getMail", "got thread data");
  const messagePromises = messages.map((m) => getMessage(m.id, headers));
  const messagesData = await Promise.all(messagePromises);
  console.timeLog("getMail", "got message data");
  const gmailData = { threads: threadsData, messages: messagesData };
  console.timeEnd("getMail");
  return gmailData;
}
