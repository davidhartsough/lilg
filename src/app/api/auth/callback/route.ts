import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { setSession } from "@/lib/session";

const isProd = process.env.NODE_ENV === "production";
const appBaseUrl = isProd ? "https://lilg.vercel.app" : "http://localhost:3000";
const redirectUri = `${appBaseUrl}/api/auth/callback`;
const tokenUrl = "https://oauth2.googleapis.com/token";
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  if (!clientId || !clientSecret) {
    console.error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set");
    throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set");
  }
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("state")?.value;
  cookieStore.delete("state");

  if (error || !code || !expectedState || !state || expectedState !== state) {
    console.error("Invalid state or code", { error, code, state });
    redirect("/");
  }

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    console.error("Failed to get tokens", { res });
    redirect("/api/auth/logout");
  }
  const tokens = await res.json();
  await setSession(tokens.refresh_token);
  redirect("/");
}
