export default defineNuxtConfig({
  modules: [
    '@nuxt/a11y',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxthub/core',
  ],

  eslint: {
    config: {
      stylistic: {
        semi: true,
        indent: 2,
      },
    },
  },
});
