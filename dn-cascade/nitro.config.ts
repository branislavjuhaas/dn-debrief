import { defineNitroConfig } from "nitropack/config";

// https://nitro.build/config
export default defineNitroConfig({
  compatibilityDate: "latest",
  srcDir: "server",
  imports: false,
  experimental: {
    openAPI: true,
    tasks: true,
  },
  openAPI: {
    route: "/api/_docs/openapi.json",
    production: "prerender",
    meta: {
      title: "DN Cascade Platform API",
      description:
        "Comprehensive data management solution transforming organizational efficiency through intelligent technology.",
      version: "2.25.0.1",
    },
    ui: {
      scalar: {
        route: "/",
      },
      swagger: false,
    },
  },
});
