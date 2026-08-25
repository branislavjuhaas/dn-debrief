import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL environment variable is missing.");
  process.exit(1);
}

const sanitizedUrl = databaseUrl.replace(/:[^:@]+@/, ":***@");
console.log(`🔗 Migrator connecting to: ${sanitizedUrl}`);

const sql = postgres(databaseUrl, {
  max: 1,
  onnotice: () => {},
});

// PASS CLIENT OPTION HERE
const db = drizzle({ client: sql });

console.log("⏳ Applying database migrations...");

try {
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("✅ Migrations applied successfully!");
} catch (error) {
  console.error("❌ Migration execution failed:", error);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
