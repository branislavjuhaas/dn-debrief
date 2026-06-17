import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL for the migrate script is not set");
  process.exit(1);
}

// 1. Initialize the production-ready client
const sql = postgres(databaseUrl, { max: 1 });

export const db = drizzle({
  client: sql,
});

// 2. Point directly to the flat migrations directory inside the container
try {
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("Migrations applied successfully!");
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
} finally {
  await sql.end();
}
