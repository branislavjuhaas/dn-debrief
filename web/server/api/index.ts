import { version } from "~~/package.json";

defineRouteMeta({
  openAPI: {
    summary: "Get API metadata",
    description: "Get the API metadata",
    tags: ["Metadata"],
    responses: {
      200: {
        description: "The requested API metadata",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "DN DebRIEF API" },
                description: {
                  type: "string",
                  example: "Intelligent debate platform",
                },
                version: { type: "string", example: "1.0.0" },
                docs: {
                  type: "object",
                  properties: {
                    openAPI: { type: "string", example: "/_docs/openapi.json" },
                    Scalar: { type: "string", example: "/api/docs" },
                  },
                },
              },
            },
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
    },
    $global: {
      components: {
        schemas: {
          Error: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "An unexpected error occurred",
              },
              statusCode: { type: "number", example: 500 },
              statusMessage: {
                type: "string",
                example: "Internal Server Error",
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (_event) => {
  return {
    name: "DN DebRIEF API",
    description: "Intelligent debate platform",
    version,
    docs: { openAPI: "/_docs/openapi.json", Scalar: "/api/docs" },
  };
});
