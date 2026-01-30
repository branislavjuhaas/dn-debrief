export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],

  eslint: {
    config: {
      stylistic: {
        semi: true,
        indent: 2,
      },
    },
  },
});
