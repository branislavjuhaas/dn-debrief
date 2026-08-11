import { promises as fs } from "node:fs";
import * as z from "zod";
import path from "node:path";

defineRouteMeta({
  openAPI: {
    tags: ["Storage (Dev)"],
    description: "Upload a file to the local development storage",
    parameters: [
      {
        name: "key",
        in: "query",
        required: true,
        schema: {
          type: "string",
        },
        description: "The storage key to write",
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/octet-stream": {
          schema: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
    responses: {
      200: {
        description: "The file was stored locally",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                  example: true,
                },
                key: {
                  type: "string",
                  example: "users/1/avatar.png",
                },
              },
            },
          },
        },
      },
      400: {
        description: "Missing key or file body",
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

const querySchema = z.object({
  key: z.string().nonempty("Missing key"),
});

export default defineEventHandler(async (event) => {
  const { key } = await getValidatedQuery(event, querySchema.parse);

  const body = await readRawBody(event, false);
  if (!body)
    throw createError({
      statusCode: 400,
      statusMessage: "No File Body",
      message: "Missing file body",
    });

  // Compute local disk path
  const filePath = path.join(process.cwd(), ".data/uploads", key);

  // Ensure local folder structure exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  // Save raw binary Buffer directly to disk
  await fs.writeFile(filePath, body);

  return { success: true, key };
});
