import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL environment variable is missing.");
  process.exit(1);
}

// Initialize a single, dedicated connection for the migration run
const sql = postgres(databaseUrl, {
  max: 1,
  onnotice: () => {}, // Suppress noisy PG notices during migrations
});

const db = drizzle(sql);

console.log("⏳ Applying database migrations...");

try {
  // Points to the ./migrations directory copied into /app in Stage 3
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("✅ Migrations applied successfully!");
} catch (error) {
  console.error("❌ Migration execution failed:", error);
  process.exit(1);
} finally {
  // Ensure the database connection pool is explicitly closed
  await sql.end({ timeout: 5 });
}
