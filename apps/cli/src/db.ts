import { cliDb } from "@dn-debrief/db/cli";
import { defineCommand } from "citty";
import consola from "consola";
import { readUserConfig } from "rc9";

let database = null;

const seed = defineCommand({
  meta: { name: "seed", description: "Seed the database with mock data" },
  run() {},
});

export const db = defineCommand({
  meta: { name: "db", description: "Database management commands" },
  subCommands: { seed },
  async setup() {
    const config = readUserConfig(".debriefrc");

    if (!config.database) {
      consola.error("Missing database URL. Configure before using database!");
    }

    try {
      database = cliDb(config.database);
    } catch {
      consola.error("Could not connect to the database at specified url!");
      return;
    }

    consola.info(`Connected to database: ${database ? "Success" : "Failed"}`);
  },
});
