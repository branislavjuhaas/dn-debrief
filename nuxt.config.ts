export default defineNuxtConfig({
  modules: [
    '@nuxt/a11y',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxthub/core',
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
});
