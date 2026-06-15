import { defineCommand } from "citty";

const seed = defineCommand({
  meta: { name: "seed", description: "Seed the database with mock data" },
  run() {},
});

export const db = defineCommand({
  meta: { name: "db", description: "Database management commands" },
  subCommands: { seed },
});
