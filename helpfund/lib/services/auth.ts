import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { users, organizations, verificationTokens } from "@/lib/db/schema";
import { hashPassword, verifyPassword, validatePasswordStrength } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import type { RegisterInput, LoginInput } from "@/lib/validations/auth";

export class AuthError extends Error {
  constructor(
    message: string,
    public code: "VALIDATION" | "CONFLICT" | "UNAUTHORIZED" | "FORBIDDEN" | "RATE_LIMIT" | "INTERNAL"
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function registerUser(
  input: RegisterInput,
  meta?: { ipAddress?: string; userAgent?: string }
) {
  const strength = validatePasswordStrength(input.password);
  if (!strength.valid) {
    throw new AuthError(strength.message || "Invalid password", "VALIDATION");
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    // Generic message to avoid email enumeration
    throw new AuthError("Unable to create account with the provided details.", "CONFLICT");
  }

  const passwordHash = await hashPassword(input.password);
  const userId = uuidv4();

  await db.insert(users).values({
    id: userId,
    email: input.email.toLowerCase(),
    emailVerified: false,
    passwordHash,
    fullName: input.fullName.trim(),
    phone: input.phone || null,
    accountType: input.accountType,
    role: "user",
    status: "active",
  });

  if (input.accountType === "organization" && input.organizationName) {
    await db.insert(organizations).values({
      id: uuidv4(),
      userId,
      name: input.organizationName.trim(),
    });
  }

  // Create email verification token (abstraction – email sending is optional)
  const token = uuidv4() + uuidv4().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  await db.insert(verificationTokens).values({
    id: uuidv4(),
    userId,
    token,
    type: "email_verification",
    expiresAt,
  });

  // Create session so user is logged in immediately after registration
  await createSession(userId, meta);

  return {
    userId,
    email: input.email.toLowerCase(),
    verificationToken: token, // for development / email abstraction
  };
}

export async function loginUser(
  input: LoginInput,
  meta?: { ipAddress?: string; userAgent?: string }
) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (result.length === 0) {
    throw new AuthError("Invalid email or password.", "UNAUTHORIZED");
  }

  const user = result[0];

  if (user.status === "suspended") {
    throw new AuthError("This account has been suspended.", "FORBIDDEN");
  }
  if (user.status === "deleted") {
    throw new AuthError("Invalid email or password.", "UNAUTHORIZED");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Invalid email or password.", "UNAUTHORIZED");
  }

  await createSession(user.id, meta);

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    accountType: user.accountType,
  };
}

export async function logoutUser() {
  await destroySession();
}

export async function createPasswordResetToken(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  // Always return success shape to avoid email enumeration
  if (result.length === 0) {
    return { success: true };
  }

  const user = result[0];
  const token = uuidv4() + uuidv4().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  // Invalidate previous reset tokens for this user
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.userId, user.id));

  await db.insert(verificationTokens).values({
    id: uuidv4(),
    userId: user.id,
    token,
    type: "password_reset",
    expiresAt,
  });

  return { success: true, token }; // token only for development / email abstraction
}

export async function resetPassword(token: string, newPassword: string) {
  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    throw new AuthError(strength.message || "Invalid password", "VALIDATION");
  }

  const result = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1);

  if (result.length === 0) {
    throw new AuthError("Invalid or expired reset link.", "UNAUTHORIZED");
  }

  const record = result[0];
  if (record.type !== "password_reset") {
    throw new AuthError("Invalid or expired reset link.", "UNAUTHORIZED");
  }
  if (new Date(record.expiresAt) < new Date()) {
    throw new AuthError("Invalid or expired reset link.", "UNAUTHORIZED");
  }

  const passwordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, record.userId));

  // Consume token
  await db.delete(verificationTokens).where(eq(verificationTokens.id, record.id));

  return { success: true };
}
