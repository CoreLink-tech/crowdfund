import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.warn(
    "[HelpFund DB] TURSO_DATABASE_URL is not set. Database operations will fail until configured."
  );
}

const client = createClient({
  url: url || "file:local.db", // fallback for local development without Turso
  authToken: authToken,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
export { schema };
