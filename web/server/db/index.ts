import { createRequire } from "node:module";
import { relations } from "./schema/relations";
import {
  drizzle as drizzlePostgresJs,
  type PostgresJsDatabase,
} from "drizzle-orm/postgres-js";
import type { PgliteDatabase } from "drizzle-orm/pglite";

type PGliteDb = PgliteDatabase<typeof relations>;
type PostgresDb = PostgresJsDatabase<typeof relations>;
export type AppDatabase = PGliteDb | PostgresDb;

const initDb = (): AppDatabase => {
  if (import.meta.dev || import.meta.test) {
    // createRequire allows dynamic synchronous loading inside dev-only branch
    const require = createRequire(import.meta.url);

    const { PGlite } = require("@electric-sql/pglite");
    const { pg_trgm } = require("@electric-sql/pglite/contrib/pg_trgm");
    const { unaccent } = require("@electric-sql/pglite/contrib/unaccent");
    const { drizzle: drizzlePglite } = require("drizzle-orm/pglite");
    const { migrate } = require("drizzle-orm/pglite/migrator");
    const fs = require("node:fs");
    const path = require("node:path");

    if (!process.env.test) {
      const dbDir = path.resolve(process.cwd(), "./.data/database");

      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
    }

    const client = new PGlite(
      process.env.test ? "memory://" : "./.data/database",
      {
        extensions: { pg_trgm, unaccent },
      },
    );

    const db = drizzlePglite({
      client,
      relations,
    });

    void migrate(db, {
      migrationsFolder: path.resolve(process.cwd(), "./server/db/migrations"),
    });

    console.log(
      "\x1b[32m✔\x1b[0m Successfully connected to the database and ran migrations",
    );

    return db;
  }

  // Production branch
  return drizzlePostgresJs(process.env.DATABASE_URL!, {
    relations,
  });
};

export const db: AppDatabase = initDb();
