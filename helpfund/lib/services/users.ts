import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * Ensure a row exists in our users table for the Clerk user.
 * Uses Clerk userId as the primary key so campaigns/donations stay linked.
 */
export async function ensureUserFromClerk(params: {
  clerkUserId: string;
  email: string;
  fullName: string;
}) {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, params.clerkUserId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  await db.insert(users).values({
    id: params.clerkUserId,
    email: params.email.toLowerCase(),
    emailVerified: true,
    passwordHash: "clerk-managed", // not used when auth is Clerk
    fullName: params.fullName || "User",
    accountType: "individual",
    role: "user",
    status: "active",
  });

  return params.clerkUserId;
}
