export default defineAppConfig({
  ui: {
    colors: {
      neutral: "zinc",
    },
    pageSection: {
      variants: {
        spacing: {
          collapse: { container: "gap-0 sm:gap-0" },
          standard: { container: "gap-6 sm:gap-8" },
          large: { container: "gap-8 sm:gap-16" },
        },
      },
      defaultVariants: {
        spacing: "collapse",
      },
    },
    pageBody: {
      base: "mt-32",
    },
  },
});
