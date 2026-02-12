import "server-only";
import { cacheLife } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "./session";

const tokenUrl = "https://oauth2.googleapis.com/token";
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId) {
  console.error("GOOGLE_CLIENT_ID is not set");
  throw new Error("GOOGLE_CLIENT_ID is not set");
}
if (!clientSecret) {
  console.error("GOOGLE_CLIENT_SECRET is not set");
  throw new Error("GOOGLE_CLIENT_SECRET is not set");
}

function getRequestInit(refreshToken: string): RequestInit {
  if (!clientId || !clientSecret) {
    console.error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set");
    throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set");
  }
  return {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  };
}

async function fetchAccessToken(refreshToken: string): Promise<string> {
  "use cache";
  cacheLife({
    stale: 300,
    revalidate: 3300,
  });

  const res = await fetch(tokenUrl, getRequestInit(refreshToken));

  if (!res.ok) {
    console.error("Failed to refresh access token");
    redirect("/api/auth/logout");
  }

  const data = await res.json();
  return data.access_token;
}

async function getRefreshTokenOrLogout() {
  const session = await getSession();
  if (!session.refreshToken) {
    console.error("No access token or refresh token in session");
    redirect("/api/auth/logout");
  }
  return session.refreshToken;
}

export default async function getAccessToken(): Promise<string> {
  const refreshToken = await getRefreshTokenOrLogout();
  return await fetchAccessToken(refreshToken);
}

export async function hasAccessToken(): Promise<boolean> {
  const session = await getSession();
  const { refreshToken } = session;
  if (!refreshToken) return false;
  await fetchAccessToken(session.refreshToken);
  return true;
}
