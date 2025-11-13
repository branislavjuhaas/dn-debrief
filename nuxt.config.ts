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
  ui: {
    colorMode: false,
  },
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1, maximum-scale=1",
      titleTemplate: "%s | DebRIEF II",
      title: "DN",
    },
  },
  fonts: {
    defaults: {
      weights: [400, 700],
      styles: ["normal", "italic"],
      subsets: ["latin"],
    },
    provider: "google",
    families: [
      {
        name: "DM Sans",
        weights: ["100 900"],
        styles: ["normal", "italic"],
        subsets: ["latin"],
        preload: true,
        provider: "google",
      },
    ],
  },
});
