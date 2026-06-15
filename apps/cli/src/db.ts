import { cliDb } from "@dn-debrief/db/cli";
import { defineCommand } from "citty";
import consola from "consola";
import { readUserConfig } from "rc9";

const getDatabase = async () => {
  const config = readUserConfig(".debriefrc");

  if (!config.database) {
    consola.error("Missing database URL. Configure before using database!");
  }

  try {
    return cliDb(config.database);
  } catch {
    consola.error("Could not connect to the database at specified url!");
    return null;
  }
};

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
  subCommands: { seed },
});
