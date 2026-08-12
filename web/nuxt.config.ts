import { version } from "./package.json";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxt/image", "@vueuse/nuxt", "motion-v/nuxt"],
  css: ["~/assets/css/main.css"],

  nitro: {
    experimental: {
      openAPI: true,
    },
    openAPI: {
      route: "/_docs/openapi.json",
      production: "runtime",
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

  ui: {
    experimental: {
      componentDetection: true,
    },
  },

  icon: {
    clientBundle: {
      icons: ["ph:arrow-up-right", "ph:moon", "ph:sun", "ph:eye"],
      scan: true,
    },
  },

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

  routeRules: {
    "/manage/**": { appLayout: "manage" },
  },

  motionV: {
    directives: true,
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
