// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/eslint",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@nuxt/image",
    "@nuxt/content",
    "@pinia/nuxt",
  ],
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1, maximum-scale=1",
      titleTemplate: "%s | DebRIEF II",
      title: "DN",
    },
  },
});
