import { defineCommand } from "citty";
import consola from "consola";
import { colorize } from "consola/utils";
import { readUserConfig, writeUserConfig } from "rc9";

const read = defineCommand({
  meta: {
    name: "read",
    description: "Read configuration for current user",
  },
  run() {
    const config = readUserConfig(".debriefrc");

    consola.info(
      `Working configuration for the user:\n${Object.entries(config)
        .map(
          ([key, value]) =>
            `  ${colorize("dim", key)}: ${colorize("green", typeof value === "object" ? JSON.stringify(value) : value)}`,
        )
        .join("\n")}`,
    );
  },
});

const update = defineCommand({
  meta: {
    name: "update",
    description: "Update configuration for current user",
  },
  args: {
    database: {
      type: "string",
      description: "Database URL of the system's database",
    },
  },
  run({ args }) {
    const currentConfig = readUserConfig(".debriefrc") || {};

    // Destructure to separate the internal '_' array from the actual config flags
    const { _, ...validArgs } = args;

    // Filter out fields the user didn't pass (undefined)
    const updates = Object.fromEntries(
      Object.entries(validArgs).filter(([_, value]) => value !== undefined),
    );

    // Merge cleanly
    const newConfig = {
      ...currentConfig,
      ...updates,
    };

    writeUserConfig(newConfig, ".debriefrc");

    consola.success("Working configuration for the user updated");
  },
});

export const config = defineCommand({
  meta: { name: "config", description: "Configuration manager commands" },
  subCommands: { read, update },
});
