import { relations } from "#db/schema/relations";
import { drizzle as drizzlePostgresJs, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { readUserConfig } from "rc9";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { unaccent } from "@electric-sql/pglite/contrib/unaccent";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import fs from "node:fs";
import path from "node:path";
import { validateConfig } from "./config";
import { diagnostics } from "./diagnostics";
import consola from "consola";

type PGliteDb = PgliteDatabase<typeof relations>;
type PostgresDb = PostgresJsDatabase<typeof relations>;
export type AppDatabase = PGliteDb | PostgresDb;

export const initDb = (): AppDatabase => {
  const config = readUserConfig(".debriefrc");

  if (!config) {
    throw diagnostics.DEBRIEF_NOT_CONFIGURED;
  }

  if (!validateConfig(config)) {
    throw diagnostics.DEBRIEF_IMPROPERLY_CONFIGURED;
  }

  if (config.db.provider === "pglite") {
    if (!fs.existsSync(config.db.path)) {
      fs.mkdirSync(config.db.path, { recursive: true });
    }

    const client = new PGlite(config.db.path, {
      extensions: { pg_trgm, unaccent },
    });

    const db = drizzlePglite({
      client,
      relations,
    });

    void migrate(db, {
      migrationsFolder: path.resolve(process.cwd(), "./../web/server/db/migrations"),
    });

    console.log("\x1b[32m✔\x1b[0m Successfully connected to the database and ran migrations");

    return db;
  }

  // Production branch
  return drizzlePostgresJs(process.env.DATABASE_URL!, {
    relations,
  });
};
