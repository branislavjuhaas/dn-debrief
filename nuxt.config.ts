// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/a11y',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/ui',
  ],

  css: ['~/assets/css/main.css'],

  eslint: {
    config: {
      stylistic: {
        semi: true,
        indent: 2,
      },
    },
  },
})
