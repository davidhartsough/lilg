import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const isProd = process.env.NODE_ENV === "production";
const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
const appBaseUrl = isProd ? "https://lilg.vercel.app" : "http://localhost:3000";
const redirectUri = `${appBaseUrl}/api/auth/callback`;
const clientId = process.env.GOOGLE_CLIENT_ID;

const scope = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

export async function GET() {
  if (!clientId) {
    console.error("GOOGLE_CLIENT_ID is not set");
    throw new Error("GOOGLE_CLIENT_ID is not set");
  }
  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("state", state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope,
    state,
  }).toString();
  const url = `${googleAuthUrl}?${params}`;
  return redirect(url);
}
