import { defineCommand } from "citty";
import consola from "consola";
import { colorize } from "consola/utils";
import { readUserConfig, writeUserConfig } from "rc9";

const camelToWords = (str: string): string => {
  const result = str
    .replace(/([A-Z])/g, " $1") // Insert space before uppercase letters
    .trim(); // Remove leading/trailing spaces

  // Capitalize the first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const validateConfig = (config: any): boolean => {
  if (!config.db) {
    return false;
  }
  if (!config.db.provider) {
    return false;
  }
  return true;
};

const readCommand = defineCommand({
  meta: {
    name: "read",
    description: "Read user configuration",
  },
  run() {
    const config = readUserConfig(".debriefrc");
    consola.info("CLI configured with the following options:");
    for (const [key, value] of Object.entries(config)) {
      // if the value is an object, nest it one more time
      if (typeof value === "object") {
        for (const [subKey, subValue] of Object.entries(value)) {
          consola.log(
            `- ${colorize("dim", camelToWords(key))} / ${colorize("dim", camelToWords(subKey))}: ${subValue}`,
          );
        }
        continue;
      }

      consola.log(`- ${colorize("dim", camelToWords(key))}: ${value}`);
    }
  },
});

const updateCommand = defineCommand({
  meta: {
    name: "update",
    description: "Update user configuration",
  },
  async run() {
    const config = readUserConfig(".debriefrc");
    const databaseEnv =
      (await consola.prompt("Select database environment (ESC for exiting)", {
        type: "select",
        options: [
          { label: "PGLite", value: "pglite" },
          { label: "PostgreSQL", value: "postgres" },
        ],
      })) ?? config.databaseEnv;

    const databasePath =
      (await consola.prompt(
        databaseEnv === "pglite"
          ? "Enter PGLite database path"
          : "Enter PostgreSQL connection string",
      )) ?? config.databasePath;

    writeUserConfig({ db: { provider: databaseEnv, path: databasePath } }, ".debriefrc");
  },
});

const initCommand = defineCommand({
  meta: {
    name: "init",
    description: "Initialize user configuration",
  },
  async run() {
    const databaseEnv = await consola.prompt("Select database environment", {
      type: "select",
      options: [
        { label: "PGLite", value: "pglite" },
        { label: "PostgreSQL", value: "postgres" },
      ],
    });

    const databasePath = await consola.prompt(
      databaseEnv === "pglite"
        ? "Enter PGLite database path"
        : "Enter PostgreSQL connection string",
    );

    writeUserConfig({ db: { provider: databaseEnv, path: databasePath } }, ".debriefrc");
    consola.success("Configuration saved successfully");
  },
});

export const configCommand = defineCommand({
  meta: {
    name: "config",
    description: "Manage userconfiguration",
  },
  subCommands: {
    init: initCommand,
    read: readCommand,
    update: updateCommand,
  },
});
