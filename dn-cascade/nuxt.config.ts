import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxtjs/google-fonts", "@pinia/nuxt"],
  devServer: {
    port: 7210,
  },
  app: {
    baseURL: "/v2/",
    pageTransition: { name: "slide-fade", mode: "out-in" },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  css: ["~/assets/css/main.css"],
  googleFonts: {
    preload: true,
    families: {
      Epilogue: {
        wght: "100..900",
        ital: "100..900",
      },
    },
  },
});
