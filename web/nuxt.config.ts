// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

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
