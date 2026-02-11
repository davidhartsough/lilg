import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/session";

const tokenUrl = "https://oauth2.googleapis.com/token";
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  if (!clientId || !clientSecret) {
    console.error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set");
    throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set");
  }

  const searchParams = request.nextUrl.searchParams;
  const goto = searchParams.get("goto");

  const session = await getSession();
  if (!session.accessToken || !session.refreshToken) {
    console.error("No access token or refresh token in session");
    redirect("/api/auth/logout");
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

  const dest = goto === "mail" || goto === "cal" ? `/${goto}` : "/";
  return NextResponse.redirect(new URL(dest, request.url));
}
