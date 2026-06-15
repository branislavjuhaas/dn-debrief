import { drizzle } from "drizzle-orm/postgres-js";
import { relations } from "./schema/relations";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Get the current file's directory name safely in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const cliDb = (databaseUrl: string) =>
  drizzle(databaseUrl, {
    relations,
  });

export const seed = (databaseUrl: string) => {
  // Path goes up one level out of 'src', then into 'migrations'
  const migrationsFolder = path.resolve(__dirname, "../migrations");

  return migrate(cliDb(databaseUrl), {
    migrationsFolder,
  });
};
