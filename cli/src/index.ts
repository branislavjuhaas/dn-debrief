import consola from "consola";
import { colorize } from "consola/utils";
import pkg from "../package.json" with { type: "json" };
import { defineCommand, runMain } from "citty";
import { configCommand } from "./config";
import { usersCommand } from "./users";

consola.log(
  colorize("greenBright", "DebRIEF CLI"),
  colorize("dim", `v${pkg.version}`),
  "- Intelligent debate CLI",
);

const main = defineCommand({
  meta: {
    name: "debrief",
    version: pkg.version,
    description: "Command line interface to manage DN DebRIEF (Sunlake) project",
  },
  subCommands: {
    config: configCommand,
    users: usersCommand,
  },
});

await runMain(main);
