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
    ignorePatterns: [
      ".output/**",
      ".data/**",
      ".nuxt/**",
      ".nitro/**",
      "dist/**",
      "node_modules/**",
    ],
  },

  fmt: {
    bracketSameLine: true,
    printWidth: 80,
    semi: true, // Keeps your preferred trailing semicolons
    singleQuote: false,
    sortPackageJson: false,
    ignorePatterns: [],
  },
});
