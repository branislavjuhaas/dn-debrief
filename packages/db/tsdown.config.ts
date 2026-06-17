import { defineConfig } from "tsdown";

export default defineConfig({
  // Automatically bundle all entry points while preserving your directory structure
  entry: ["src/index.ts", "src/cli.ts", "src/schema.ts"],
  format: ["esm"],
  clean: true,
  dts: true,
  outDir: "dist",

  external: ["postgres", "drizzle-orm"],
});
