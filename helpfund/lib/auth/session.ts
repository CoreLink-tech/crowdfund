import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";

const SESSION_COOKIE = "helpfund_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: "user" | "admin";
  accountType: "individual" | "organization";
  emailVerified: boolean;
  status: string;
};

export async function createSession(
  userId: string,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
    ipAddress: meta?.ipAddress ?? null,
    userAgent: meta?.userAgent ?? null,
  });

  const token = await new SignJWT({ sid: sessionId, uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return sessionId;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecret());
      const sessionId = payload.sid as string;
      if (sessionId) {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
      }
    } catch {
      // ignore invalid token
    }
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentSession(): Promise<{
  session: { id: string; expiresAt: Date };
  user: SessionUser;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sessionId = payload.sid as string;
    const userId = payload.uid as string;

    if (!sessionId || !userId) return null;

    const result = await db
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.id, sessionId),
          eq(sessions.userId, userId),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];

    if (row.user.status !== "active") {
      await destroySession();
      return null;
    }

    return {
      session: {
        id: row.session.id,
        expiresAt: row.session.expiresAt as Date,
      },
      user: {
        id: row.user.id,
        email: row.user.email,
        fullName: row.user.fullName,
        role: row.user.role as "user" | "admin",
        accountType: row.user.accountType as "individual" | "organization",
        emailVerified: row.user.emailVerified,
        status: row.user.status,
      },
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const current = await getCurrentSession();
  if (!current) {
    throw new Error("UNAUTHORIZED");
  }
  return current.user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
