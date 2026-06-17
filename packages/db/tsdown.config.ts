import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts", "src/schema.ts", "src/migrate.ts"],
  format: ["esm"],
  clean: true,
  dts: true,
  outDir: "dist",

  external: ["postgres", "drizzle-orm"],
});
