import { relations } from "./schema/relations";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { unaccent } from "@electric-sql/pglite/contrib/unaccent";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgresJs, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/pglite/migrator";
import fs from "node:fs";
import path from "node:path";

type PGliteDb = PgliteDatabase<typeof relations>;
type PostgresDb = PostgresJsDatabase<typeof relations>;
export type AppDatabase = PGliteDb | PostgresDb;

const initDb = (): AppDatabase => {
  if (import.meta.dev || import.meta.test) {
    if (!process.env.test) {
      const dbDir = path.resolve(process.cwd(), "./.data/database");

      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
    }

    const client = new PGlite(process.env.test ? "memory://" : "./.data/database", {
      extensions: { pg_trgm, unaccent },
    });

    const db = drizzlePglite({
      client,
      relations,
    });

    migrate(db, {
      migrationsFolder: path.resolve(process.cwd(), "./server/db/migrations"),
    });

    return db;
  } else {
    return drizzlePostgresJs(process.env.DATABASE_URL!, {
      relations,
    });
  }
};

export const db: AppDatabase = initDb();
