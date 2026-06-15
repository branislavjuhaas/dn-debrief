import { defineCommand } from "citty";
import consola from "consola";
import { colorize } from "consola/utils";
import { writeUserConfig } from "rc9";

export const init = defineCommand({
  meta: { name: "init", description: "Initialize instance of the cli" },
  async run() {
    consola.log(
      `${colorize("blueBright", "Welcome to the Intelligent Debate platform—welcome to the 21st century!")}\nTo configure the CLI, enter following parameters`,
    );

    const database = await consola.prompt(
      "Database URL of the system's database:",
    );

    const config = {
      database,
    };

    writeUserConfig(config, ".debriefrc");

    consola.success("Working configuration for the user written");
  },
});
