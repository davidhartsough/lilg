"use server";
import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const fiveMinutes = 5 * 60 * 1000;

export default async function getAccessToken(destination: "mail" | "cal") {
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

  redirect(`/api/auth/refresh?goto=${destination}`);
}
