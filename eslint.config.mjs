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
    prettierConfig, // disables conflicting stylistic rules
    {
      plugins: { prettier: prettierPlugin },
      rules: {
        "prettier/prettier": "error", // runs Prettier during eslint --fix
      },
    },
  )
  .overrideRules({
    "vue/multi-word-component-names": "off",
    "vue/max-attributes-per-line": ["error", { singleline: 5 }],
    "@typescript-eslint/no-restricted-types": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
  });
