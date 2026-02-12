"use server";
import "server-only";
import getAccessToken from "./tokens";

interface Thread {
  id: string;
  snippet: string;
}
interface MessageData {
  id: string;
  snippet: string;
  labelIds: string[];
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
  snippet: string;
  subject: string;
  participants: string[];
  date: number;
  messages: Message[];
}

const gmailUrl = "https://gmail.googleapis.com/gmail/v1/users/me/";
const threadsUrl = `${gmailUrl}threads`;
// const messagesUrl = `${gmailUrl}messages`;
const params = new URLSearchParams({
  maxResults: "25",
  labelIds: "INBOX",
  q: "newer_than:35d",
}).toString();

async function getThreads(headers: RequestInit): Promise<Thread[]> {
  const res = await fetch(`${threadsUrl}?${params}`, headers);
  if (!res.ok) {
    console.error("Failed to fetch threads", res.status);
    return [];
  }
  const data = await res.json();
  // console.log("threads data:", data);
  return data.threads ?? [];
}

const metadataParams = new URLSearchParams({
  format: "metadata",
  metadataHeaders: "Subject",
});
metadataParams.append("metadataHeaders", "From");
// const metadataQuery = metadataParams.toString();
metadataParams.append(
  "fields",
  "id,messages(id,snippet,internalDate,labelIds,payload/headers)",
);
const threadQuery = metadataParams.toString();

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

function getParticipants(messages: MessageData[]): string[] {
  const participants = new Set<string>();
  messages.forEach((msg) => {
    if (msg.labelIds.includes("SENT")) return;
    msg.payload.headers.forEach((h) => {
      if (h.name === "From") {
        participants.add(h.value);
      }
    });
  });
  return Array.from(participants);
}

export default async function getMail(): Promise<GmailConvo[]> {
  console.log("getMail()");
  console.time("getMail");
  const token = await getAccessToken();

  const headers = { headers: { Authorization: `Bearer ${token}` } };
  console.timeLog("getMail", "got token");
  const threads = await getThreads(headers);
  console.timeLog("getMail", "got threads:", threads.length);

  const promises = await Promise.allSettled(
    threads.map(({ id }) => getThread(id, headers)),
  );
  console.timeLog("getMail", "got thread data:", promises.length);
  console.log(promises);

  const threadsData = promises
    .filter((p) => p.status === "fulfilled")
    .map((p) => p.value)
    .filter((d) => !!d && !!d.messages && d.messages.length > 0);

  console.log(threadsData);

  const gmailData: GmailConvo[] = threadsData.map((thread: ThreadData) => ({
    id: thread.id,
    snippet:
      threads.find(({ id }) => id === thread.id)?.snippet ??
      thread.messages.at(-1)?.snippet ??
      "(No snippet)",
    subject:
      thread.messages[0]?.payload.headers.find((h) => h.name === "Subject")
        ?.value ?? "(Unknown subject)",
    participants: getParticipants(thread.messages),
    date: Number(thread.messages.at(-1)?.internalDate),
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
  console.log("gmailData.length:", gmailData.length);
  return gmailData;
}
