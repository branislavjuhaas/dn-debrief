import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },

  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    plugins: ["typescript", "vue", "vitest", "unicorn"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      "typescript/no-explicit-any": "off",
      "typescript/unbound-method": "off",
      "no-console": "warn",
    },
    overrides: [
      {
        files: [
          "apps/web/server/**/*",
          "apps/cli/**/*",
          "packages/db/src/migrate.*",
          "app/components/OgImage/*",
        ],
        rules: {
          "no-console": "off",
        },
      },
    ],
    ignorePatterns: [
      ".output/**",
      ".data/**",
      ".nuxt/**",
      ".nitro/**",
      ".cache/**",
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },

  fmt: {
    bracketSameLine: true,
    printWidth: 80,
    semi: true,
    singleQuote: false,
    sortPackageJson: false,
    ignorePatterns: [],
  },
});
