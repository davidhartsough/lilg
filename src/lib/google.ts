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

/*
// snippet: string;
// internalDate: string;
// messages: {id threadId};
// messageCount: number;
// date: string;
// subject: string;
// from: string;
interface Message {
  id: string;
  threadId: string;
}
*/
interface Thread {
  id: string;
  snippet: string;
}
interface MessageData {
  id: string;
  snippet: string;
  internalDate: string;
  payload: {
    headers: [
      {
        name: "From";
        value: string;
      },
      {
        name: "Subject";
        value: string;
      },
    ];
  };
}
interface ThreadData {
  id: string;
  messages: MessageData[];
}
interface Message {
  id: string;
  snippet: string;
  date: number;
  from: string;
}
interface GmailConvo {
  id: string;
  subject: string;
  messages: Message[];
}

const gmailUrl = "https://gmail.googleapis.com/gmail/v1/users/me/";
const threadsUrl = `${gmailUrl}threads`;
// const messagesUrl = `${gmailUrl}messages`;
const params = new URLSearchParams({
  maxResults: "40",
  labelIds: "INBOX",
  q: "newer_than:35d",
}).toString();

// threads[] each = id and snippet
async function getThreads(headers: RequestInit): Promise<Thread[]> {
  const res = await fetch(`${threadsUrl}?${params}`, headers);
  if (!res.ok) {
    console.error("Failed to fetch threads", res.status);
    return [];
  }
  const data = await res.json();
  console.log("threads data:", data);
  return data.threads ?? [];
}

/*
// messages[] each = id and threadId
async function getMessages(headers: RequestInit): Promise<Message[]> {
  const res = await fetch(`${messagesUrl}?${params}`, headers);
  // const res = await fetch(`${gmailUrl}threads/${threadId}/messages`, headers);
  if (!res.ok) {
    console.error("Failed to fetch messages", res.status);
    return [];
  }
  const data = await res.json();
  console.log("messages data:", data);
  return data.messages ?? [];
}
*/

const metadataParams = new URLSearchParams({
  format: "metadata",
  metadataHeaders: "Subject",
});
metadataParams.append("metadataHeaders", "From");
// const metadataQuery = metadataParams.toString();
metadataParams.append(
  "fields",
  "id,messages(id,snippet,internalDate,payload/headers)",
);
const threadQuery = metadataParams.toString();

// email message IDs and email headers
async function getThread(threadId: string, headers: RequestInit) {
  const res = await fetch(`${threadsUrl}/${threadId}?${threadQuery}`, headers);
  if (!res.ok) {
    console.error("Failed to fetch thread", res.status);
    return [];
  }
  const data = await res.json();
  return data;
}
/*
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
*/

export async function getMail() {
  console.time("getMail");
  const token = await getAccessToken();
  const headers = { headers: { Authorization: `Bearer ${token}` } };
  console.timeLog("getMail", "got token");
  const threads = await getThreads(headers);
  console.timeLog("getMail", "got threads");
  // const messages = await getMessages(headers);
  // console.timeLog("getMail", "got messages");
  const threadsData = await Promise.all(
    threads.map(({ id }) => getThread(id, headers)),
  );
  console.timeLog("getMail", "got thread data");
  // const messagePromises = messages.map(({ id }) => getMessage(id, headers));
  // const messagesData = await Promise.all(messagePromises);
  // console.timeLog("getMail", "got message data");
  // const gmailData = { threads: threadsData, messages: messagesData };
  const gmailData: GmailConvo[] = threadsData.map((thread: ThreadData) => ({
    id: thread.id,
    snippet:
      threads.find(({ id }) => id === thread.id)?.snippet ??
      thread.messages[-1]?.snippet ??
      "(No snippet)",
    subject:
      thread.messages[0]?.payload.headers.find((h) => h.name === "Subject")
        ?.value ?? "(Unknown subject)",
    messages: thread.messages.map((msg) => ({
      id: msg.id,
      snippet: msg.snippet,
      date: Number(msg.internalDate),
      from:
        msg.payload.headers.find((h) => h.name === "From")?.value ??
        "(Unknown sender)",
    })),
  }));
  console.timeEnd("getMail");
  return gmailData;
}
