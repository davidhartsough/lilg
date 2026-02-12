import "server-only";
import {
  getIronSession,
  type IronSession,
  type SessionOptions,
} from "iron-session";
import { cookies } from "next/headers";

// https://github.com/vvo/iron-session

export interface SessionData {
  refreshToken: string;
}

const sessionPassword = (process.env.SESSION_PASSWORD as string) || "";
if (!sessionPassword || sessionPassword.length < 32) {
  throw new Error("SESSION_PASSWORD must be at least 32 characters long.");
}

const sessionOptions: SessionOptions = {
  cookieName: "session",
  password: sessionPassword,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function setSession(refreshToken: string) {
  const session = await getSession();
  session.refreshToken = refreshToken;
  await session.save();
}

export async function endSession() {
  const session = await getSession();
  session.destroy();
}
