// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    '@stylistic/indent': ['error', 2],
    '@stylistic/no-tabs': 'error',
    '@stylistic/semi': ['error', 'always'],
    'vue/multi-word-component-names': 'off',
  },
});
