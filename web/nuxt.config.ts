import { version } from "./package.json";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  nitro: {
    experimental: {
      openAPI: true,
    },
    openAPI: {
      route: "/_docs/openapi.json",
      production: "prerender",
      meta: {
        title: "DN Debrief API",
        description: "Intelligent debate platform",
        version: version,
      },
      ui: {
        scalar: {
          route: "/api/docs",
        },
        swagger: false,
      },
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
      exclude: ["@aws-sdk/client-ses"],
    },
  },
});
