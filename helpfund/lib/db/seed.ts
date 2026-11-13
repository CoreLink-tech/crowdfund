/**
 * Development seed script.
 * Run with: npm run db:seed
 *
 * This creates default categories and (optionally) a first admin user.
 * It is safe to re-run; it uses upsert-style checks.
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import "dotenv/config";
import * as schema from "./schema";

const DEFAULT_CATEGORIES = [
  { name: "Medical", slug: "medical", description: "Medical treatments, surgeries and health-related needs", sortOrder: 1 },
  { name: "Education", slug: "education", description: "School fees, scholarships and learning support", sortOrder: 2 },
  { name: "Emergency", slug: "emergency", description: "Urgent needs after accidents, disasters or crises", sortOrder: 3 },
  { name: "Community", slug: "community", description: "Community projects and local development", sortOrder: 4 },
  { name: "Business", slug: "business", description: "Small business and entrepreneurial projects", sortOrder: 5 },
  { name: "Religious", slug: "religious", description: "Faith-based and religious community needs", sortOrder: 6 },
  { name: "Charity", slug: "charity", description: "Charitable causes and nonprofit work", sortOrder: 7 },
  { name: "Memorial", slug: "memorial", description: "Memorial and funeral support", sortOrder: 8 },
  { name: "Personal", slug: "personal", description: "Personal goals and life events", sortOrder: 9 },
  { name: "Other", slug: "other", description: "Other legitimate fundraising needs", sortOrder: 10 },
];

async function main() {
  const url = process.env.TURSO_DATABASE_URL || "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log(`[Seed] Connecting to ${url.startsWith("file:") ? "local SQLite" : "Turso"}...`);

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  // Seed categories
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await db
      .select()
      .from(schema.campaignCategories)
      .where(eq(schema.campaignCategories.slug, cat.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.campaignCategories).values({
        id: uuidv4(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
      });
      console.log(`[Seed] Created category: ${cat.name}`);
    } else {
      console.log(`[Seed] Category already exists: ${cat.name}`);
    }
  }

  // Optional first admin (only if ADMIN_EMAIL and ADMIN_PASSWORD are set)
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME || "Platform Admin";

  if (adminEmail && adminPassword) {
    const existingAdmin = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, adminEmail.toLowerCase()))
      .limit(1);

    if (existingAdmin.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      const adminId = uuidv4();
      await db.insert(schema.users).values({
        id: adminId,
        email: adminEmail.toLowerCase(),
        emailVerified: true,
        passwordHash,
        fullName: adminName,
        accountType: "individual",
        role: "admin",
        status: "active",
      });
      console.log(`[Seed] Created admin user: ${adminEmail}`);
    } else {
      // Ensure role is admin
      if (existingAdmin[0].role !== "admin") {
        await db
          .update(schema.users)
          .set({ role: "admin", updatedAt: new Date() })
          .where(eq(schema.users.id, existingAdmin[0].id));
        console.log(`[Seed] Upgraded existing user to admin: ${adminEmail}`);
      } else {
        console.log(`[Seed] Admin already exists: ${adminEmail}`);
      }
    }
  } else {
    console.log(
      "[Seed] Skipping admin creation. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create the first admin."
    );
  }

  console.log("[Seed] Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[Seed] Failed:", err);
  process.exit(1);
});
