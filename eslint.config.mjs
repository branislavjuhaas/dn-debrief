import { createConfigForNuxt } from "@nuxt/eslint-config/flat";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: {
      commaDangle: "never",
      braceStyle: "1tbs",
      semi: true,
    },
  },
})
  .append(
    // Disable stylistic ESLint rules that conflict with Prettier's output.
    prettierConfig,
    {
      plugins: { prettier: prettierPlugin },
      rules: {
        "prettier/prettier": [
          "error",
          {
            bracketSameLine: true,
          },
        ],
      },
    },
  )
  .overrideRules({
    // Let Prettier fully control template closing bracket placement.
    "vue/html-closing-bracket-newline": "off",
    "@stylistic/vue/html-closing-bracket-newline": "off",
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-restricted-types": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
  });
