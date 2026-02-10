import "server-only";
import { redirect } from "next/navigation";
import { getSession, setSession } from "@/lib/session";

const tokenUrl = "https://oauth2.googleapis.com/token";
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const fiveMinutes = 5 * 60 * 1000;

export default async function getAccessToken() {
  if (!clientId || !clientSecret) {
    console.error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set");
    throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set");
  }
  const session = await getSession();
  if (!session.accessToken || !session.refreshToken) {
    console.error("No access token or refresh token in session");
    redirect("/api/auth/logout");
  }
  if (session.expiresAt > Date.now() + fiveMinutes) {
    return session.accessToken;
  }
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: session.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    console.error("Failed to refresh access token");
    redirect("/api/auth/logout");
  }
  const data = await res.json();
  await setSession({
    accessToken: data.access_token,
    refreshToken: session.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  });
  return data.access_token;
}
