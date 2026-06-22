// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/a11y",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxt/test-utils/module",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "motion-v/nuxt",
    "@sentry/nuxt/module",
  ],

  devtools: { enabled: true },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      charset: "utf-8",
      title: "Inteligentná debatná platforma",
      titleTemplate: "%s | DebRIEF II",
      htmlAttrs: {
        lang: "sk",
      },
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  css: ["~/assets/css/main.css"],

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
        "@internationalized/date",
        "@number-flow/vue",
        "better-auth/client",
        "better-auth/client/plugins",
        "better-auth/plugins/access",
        "better-auth/plugins/admin/access",
        "date-fns",
        "zod",
      ],
    },
  },

  sentry: {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },

  sourcemap: {
    client: "hidden",
    server: true,
  },

  runtimeConfig: {
    public: {
      sentry: {
        dsn: process.env.SENTRY_DSN,
      },
    },
  },
});
