// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/a11y",
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxt/content",
    "@nuxt/test-utils/module",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "nuxt-studio",
    "motion-v/nuxt",
  ],
  devtools: { enabled: true },

  app: {
    head: {
      charset: "utf-8",
      title: "Inteligentná debatná platforma",
      description:
        "DebRIEF II je inteligentná debatná platforma využívajúca moderné technológie na zlepšenie správy Slovenskej debatnej asociácie.",
      titleTemplate: "%s | DebRIEF II",
      htmlAttrs: {
        lang: "sk",
      },
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  css: ["~/assets/css/main.css"],

  content: {
    experimental: { sqliteConnector: "native" },
  },

  experimental: {
    inlineRouteRules: true,
  },

  compatibilityDate: "2025-07-15",

  nitro: {
    experimental: {
      tasks: true,
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        "better-auth/client",
        "better-auth/client/plugins",
        "better-auth/plugins/access",
        "better-auth/plugins/admin/access",
      ],
    },
  },

  studio: {
    repository: {
      provider: "github",
      owner: "branislavjuhaas",
      repo: "dn-debrief",
      branch: "main",
    },
  },
});
