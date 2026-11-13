import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import "dotenv/config";

async function main() {
  const url = process.env.TURSO_DATABASE_URL || "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log(`[HelpFund] Running migrations against ${url.startsWith("file:") ? "local SQLite" : "Turso"}...`);

  const client = createClient({
    url,
    authToken,
  });

  const db = drizzle(client);

  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("[HelpFund] Migrations completed successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[HelpFund] Migration failed:", err);
  process.exit(1);
});
