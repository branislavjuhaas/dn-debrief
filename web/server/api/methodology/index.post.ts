import { db } from "#server/db";
import { methodologyFiles } from "#server/db/schema/methodology";
import { getPresignedUploadUrl } from "#server/utils/storage";
import * as z from "zod";

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
  name: z.string().trim().min(1, "Name is required").max(255),
  contentType: z.string().optional().default("application/octet-stream"),
});

export default defineEventHandler(async (event) => {
  const user = await requireUser(event, ["developer", "admin"]);
  const { name, contentType } = await readValidatedBody(
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

  const extension =
    contentType
      .split("/")
      .pop()
      ?.replace(/[^a-zA-Z0-9]+/g, "") || null;
  const objectKey = `methodology/${Date.now()}-${safeName}${extension ? `.${extension}` : ""}`;

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

  const uploadUrl = await getPresignedUploadUrl(objectKey, contentType);

  return {
    uploadUrl,
    key: objectKey,
    file: createdFile,
  };
});
