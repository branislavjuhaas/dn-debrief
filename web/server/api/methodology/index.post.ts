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
              isExternal: {
                type: "boolean",
                description: "Whether this is an external URL link",
                default: false,
              },
              url: {
                type: "string",
                format: "uri",
                description:
                  "URL to the external file (required when isExternal is true)",
                example: "https://drive.google.com/...",
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
        description: "Upload URL generated or external record created",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                uploadUrl: { type: "string", format: "uri", nullable: true },
                key: { type: "string", nullable: true },
                file: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                    isExternal: { type: "boolean" },
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

const bodySchema = z
  .object({
    name: z.string().trim().min(1, "Názov je povinný").max(255),
    isExternal: z.boolean().optional().default(false),
    url: z.string().url("Neplatná URL adresa").max(2048).optional(),
    contentType: z.string().optional().default("application/octet-stream"),
    size: z
      .number()
      .int("Veľkosť súboru musí byť celé číslo")
      .positive("Veľkosť súboru musí byť kladné číslo")
      .max(MAX_FILE_SIZE, "Súbor nesmie presiahnuť 10MB")
      .optional(),
    filename: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isExternal && !data.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL adresa je povinná pre externý odkaz",
        path: ["url"],
      });
    }
  });

export default defineEventHandler(async (event) => {
  const user = await requireUser(event, ["developer", "admin"]);
  const body = await readValidatedBody(event, bodySchema.parse);

  if (body.isExternal && body.url) {
    const createdFiles = await db
      .insert(methodologyFiles)
      .values({
        name: body.name,
        isExternal: true,
        fileUrl: body.url,
        authorId: user.id,
      })
      .returning();

    return {
      uploadUrl: null,
      key: null,
      file: createdFiles[0],
    };
  }

  const safeName =
    body.name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "file";

  let extension = "";
  if (body.filename) {
    const parsed = path.parse(body.filename);
    extension = parsed.ext.replace(/^\./, "");
  }
  if (
    !extension &&
    body.contentType &&
    body.contentType !== "application/octet-stream"
  ) {
    extension =
      body.contentType
        .split("/")
        .pop()
        ?.replace(/[^a-zA-Z0-9]+/g, "") || "";
  }

  const guid = crypto.randomUUID().slice(0, 8);
  const objectKey = `methodology/${Date.now()}-${guid}-${safeName}${extension ? `.${extension}` : ""}`;

  const createdFiles = await db
    .insert(methodologyFiles)
    .values({
      name: body.name,
      isExternal: false,
      fileUrl: objectKey,
      authorId: user.id,
    })
    .returning();

  const createdFile = createdFiles[0];

  const uploadUrl = await getPresignedUploadUrl(
    objectKey,
    body.contentType,
    body.size,
  );

  return {
    uploadUrl,
    key: objectKey,
    file: createdFile,
  };
});
