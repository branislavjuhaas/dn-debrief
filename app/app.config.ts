export default defineAppConfig({
  // https://ui.nuxt.com/getting-started/theme#design-system
  ui: {
    colors: {
      primary: 'green',
      neutral: 'zinc',
    },
    // add variant without border-bottom
    pageHeader: {
      slots: {
        root: 'border-none mt-20',
      },
    },
  },
});
