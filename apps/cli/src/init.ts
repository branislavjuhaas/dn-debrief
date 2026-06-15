import { defineCommand } from "citty";
import consola from "consola";
import { writeUserConfig } from "rc9";

export const init = defineCommand({
  meta: { name: "init", description: "Initialize instance of the cli" },
  args: {
    database: {
      type: "string",
      description: "Database URL of the system's database",
    },
  },
  run({ args }) {
    const config = {
      database: args.database,
    };

    writeUserConfig(config, ".debriefrc");

    consola.success("Written working configuration for the user");
  },
});
