import { cliDb } from "@dn-debrief/db/cli";
import { defineCommand } from "citty";
import { consola } from "consola";
import { sql } from "drizzle-orm";
import { readUserConfig } from "rc9";

const getDatabase = async () => {
  const config = readUserConfig(".debriefrc");

  if (!config.database) {
    consola.error("Missing database URL. Configure before using database!");
  }

  consola.wrapAll();

  const database = cliDb(config.database);

  try {
    await database.execute(sql`SELECT 1`);
  } catch {
    throw consola.error(
      "Couldn't connect to the postgres database at a specified url.",
    );
  }

  return database;
};

const clear = defineCommand({
  meta: { name: "clear", description: "Clear all the data from the database" },
  async run() {
    const database = await getDatabase();

    const result = await database.execute<{ table_name: string }>(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name != '_drizzle_migrations'; 
    `);

    const tableNames = result.map((row) => row.table_name);

    if (tableNames.length === 0) {
      consola.info("No tables found in the database.");
      return;
    }

    const formattedTables = tableNames.map((name) => `"${name}"`).join(", ");

    // 4. Run the truncate command
    await database.execute(
      sql.raw(`TRUNCATE TABLE ${formattedTables} RESTART IDENTITY CASCADE;`),
    );

    consola.success(`Successfully truncated tables: ${tableNames.join(", ")}`);

    await database.$client.end();
  },
});

const seed = defineCommand({
  meta: { name: "seed", description: "Seed the database with mock data" },
  async run() {
    const database = await getDatabase();

    if (!database) {
      return;
    }
  },
});

export const db = defineCommand({
  meta: { name: "db", description: "Database management commands" },
  subCommands: { clear, seed },
});
