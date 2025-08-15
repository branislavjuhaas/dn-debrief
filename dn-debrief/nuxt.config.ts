// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@prisma/nuxt"],
  runtimeConfig: {
    auth: {
      signerKey: process.env.AUTH_SIGNER_KEY,
      saltSeparator: process.env.AUTH_SALT_SEPARATOR,
      rounds: process.env.AUTH_ROUNDS,
      memoryCost: process.env.AUTH_MEMORY_COST,
      secret: process.env.AUTH_SECRET,
    },
  },
  nitro: {
    experimental: {
      openAPI: true,
      tasks: true,
    },
    openAPI: {
      route: "/api/_docs/openapi.json",
      production: "prerender",
      meta: {
        title: "DN Cascade Platform API",
        description: "API documentation for DN Cascade Platform",
        version: "2.25.0.1",
      },
      ui: {
        scalar: {
          route: "/api/_docs",
        },
        swagger: false,
      },
    },
  },
});
