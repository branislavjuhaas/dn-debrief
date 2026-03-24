// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/a11y",
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxt/test-utils/module",
    "@pinia/nuxt",
  ],
  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],
  compatibilityDate: "2025-07-15",

  nitro: {
    preset: "bun",
  },
});