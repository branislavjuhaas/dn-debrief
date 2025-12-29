// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/content",
    "@nuxt/ui",
    "@nuxt/image",
    "@nuxt/hints",
    "@nuxt/eslint",
    "v-gsap-nuxt",
    "@nuxthub/core",
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

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  hub: {
    db: {
      dialect: "postgresql",
      driver: "neon-http",
    },
    blob: {
      driver: "fs",
      dir: ".data/blob",
    },
    kv: {
      driver: "cloudflare-kv-binding",
      namespaceId: "d6ea32a01fe140d7a45fc76d40265073",
    },
    cache: {
      driver: "cloudflare-kv-binding",
      namespaceId: "7cf7f3f9f90443259577e5501e262f94",
    },
  },
  $production: {
    hub: {
      blob: {
        driver: "cloudflare-r2",
        bucketName: "dn-cascade-r2",
      },
    },
    sourcemap: false,
  },

  ui: {
    fonts: false,
  },
});
