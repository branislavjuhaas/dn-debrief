import path from "node:path";
import { db } from "#server/db";
import { methodologyFiles } from "#server/db/schema/methodology";
import { getPresignedUploadUrl } from "#server/utils/storage";
import * as z from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

defineRouteMeta({
  openAPI: {
    tags: ["Methodology"],
    summary: "Create methodology upload",
    description:
      "Create a methodology file record and return a presigned upload URL.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Display name for the methodology file",
              },
              contentType: {
                type: "string",
                description: "Content type of the file to upload",
                example: "application/pdf",
              },
              size: {
                type: "integer",
                description: "File size in bytes (max 10MB)",
                maximum: 10485760,
              },
              filename: {
                type: "string",
                description: "Original filename",
                example: "document.pdf",
              },
            },
            required: ["name"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Upload URL generated and database record created",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                uploadUrl: { type: "string", format: "uri" },
                key: { type: "string" },
                file: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                    fileUrl: { type: "string" },
                    authorId: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
});

const bodySchema = z.object({
  name: z.string().trim().min(1, "Názov je povinný").max(255),
  contentType: z.string().optional().default("application/octet-stream"),
  size: z
    .number()
    .int("Veľkosť súboru musí byť celé číslo")
    .positive("Veľkosť súboru musí byť kladné číslo")
    .max(MAX_FILE_SIZE, "Súbor nesmie presiahnuť 10MB")
    .optional(),
  filename: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const user = await requireUser(event, ["developer", "admin"]);
  const { name, contentType, size, filename } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const safeName =
    name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "file";

  let extension = "";
  if (filename) {
    const parsed = path.parse(filename);
    extension = parsed.ext.replace(/^\./, "");
  }
  if (!extension && contentType && contentType !== "application/octet-stream") {
    extension =
      contentType
        .split("/")
        .pop()
        ?.replace(/[^a-zA-Z0-9]+/g, "") || "";
  }

  const guid = crypto.randomUUID().slice(0, 8);
  const objectKey = `methodology/${Date.now()}-${guid}-${safeName}${extension ? `.${extension}` : ""}`;

  const createdFiles = await db
    .insert(methodologyFiles)
    .values({
      name,
      isExternal: false,
      fileUrl: objectKey,
      authorId: user.id,
    })
    .returning();

  const createdFile = createdFiles[0];

  const uploadUrl = await getPresignedUploadUrl(objectKey, contentType, size);

  return {
    uploadUrl,
    key: objectKey,
    file: createdFile,
  };
});
