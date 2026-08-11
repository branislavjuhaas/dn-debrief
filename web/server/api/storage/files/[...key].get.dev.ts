import { createReadStream, existsSync } from "node:fs";
import path from "node:path";

defineRouteMeta({
  openAPI: {
    tags: ["Storage (Dev)"],
    description: "Get a file from the local development storage",
    parameters: [
      {
        name: "key",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
        description: "The storage key to read",
      },
    ],
    responses: {
      200: {
        description: "The requested file contents",
        content: {
          "application/octet-stream": {
            schema: {
              type: "string",
              format: "binary",
            },
          },
        },
      },
      400: {
        description: "Missing key",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      404: {
        description: "File not found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
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
  },
});

export default defineEventHandler(async (event) => {
  const key = event.context.params?.key;
  if (!key)
    throw createError({
      statusCode: 400,
      statusMessage: "Missing Key",
      message: "Missing key",
    });

  const filePath = path.join(process.cwd(), ".data/uploads", key);

  if (!existsSync(filePath)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "File not found",
    });
  }

  // Stream local disk file back to frontend
  return sendStream(event, createReadStream(filePath));
});
