import { defineCommand, runMain } from "citty";
import { consola } from "consola";
import { colorize } from "consola/utils";
import { db } from "./db";
import { config } from "./config";
import { init } from "./init";

const main = defineCommand({
  meta: {
    name: "debrief",
    version: "2.26.0.1",
    description: "Command line interface of DebRIEF",
  },
  subCommands: {
    init,
    config,
    db,
  },
  setup() {
    consola.log(
      colorize("bold", colorize("magenta", "DebRIEF II")) +
        colorize("dim", " - Intelligent platform's CLI") +
        "\n",
    );
  },
});

void runMain(main);
