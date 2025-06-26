// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxt/ui", "@nuxt/image"],
  css: ["@/assets/css/main.css"],
  fonts: {
    defaults: {
      weights: [400, 700],
      styles: ["normal", "italic"],
      subsets: ["latin"],
    },
    provider: "google",
    families: [
      {
        name: "Epilogue",
        weights: [400, 700],
        styles: ["normal", "italic"],
        subsets: ["latin"],
        preload: true,
        provider: "google",
      },
    ],
  },
});
