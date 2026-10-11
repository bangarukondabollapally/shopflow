import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "@/server/db";

export interface SessionData {
  userId?: string;
  role?: "CUSTOMER" | "SUPPORT_ANALYST" | "ADMIN";
  email?: string;
  name?: string;
  sessionToken?: string;
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "complex_password_at_least_32_characters_long_for_iron_session_12345",
  cookieName: "shopflow_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getCurrentSession() {
  const cookieStore = cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

export async function createDbSession(userId: string) {
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  const dbSession = await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expiresAt,
    },
    include: {
      user: true,
    },
  });

  const session = await getCurrentSession();
  session.userId = dbSession.user.id;
  session.role = dbSession.user.role;
  session.email = dbSession.user.email;
  session.name = dbSession.user.name;
  session.sessionToken = dbSession.sessionToken;
  await session.save();

  return dbSession;
}

export async function destroySession() {
  const session = await getCurrentSession();
  if (session.sessionToken) {
    await prisma.session.deleteMany({
      where: { sessionToken: session.sessionToken },
    });
  }
  session.destroy();
}

export async function getAuthenticatedUser() {
  const session = await getCurrentSession();
  if (!session.userId || !session.sessionToken) {
    return null;
  }

  const dbSession = await prisma.session.findUnique({
    where: { sessionToken: session.sessionToken },
    include: { user: true },
  });

  if (!dbSession || dbSession.expiresAt < new Date()) {
    return null;
  }

  return dbSession.user;
}
