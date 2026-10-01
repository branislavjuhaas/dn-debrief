import { z } from "zod";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "Upload event file",
    description: "Generate a presigned upload URL for an event image file.",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              contentType: {
                type: "string",
                example: "image/jpeg",
              },
              fileExtension: {
                type: "string",
                example: "jpg",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Upload URL generated successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                uploadUrl: {
                  type: "string",
                  format: "uri",
                  example:
                    "http://localhost:3000/api/storage/upload?key=events/files/12-uuid.jpg&contentType=image%2Fjpeg",
                },
                key: {
                  type: "string",
                  example:
                    "events/files/12-f81d4fae-7dec-11d0-a765-00a0c91e6bf6.jpg",
                },
                publicUrl: {
                  type: "string",
                  format: "uri",
                  example:
                    "http://localhost:3000/api/storage/files/events/files/12-f81d4fae-7dec-11d0-a765-00a0c91e6bf6.jpg",
                },
              },
              required: ["uploadUrl", "key", "publicUrl"],
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
      403: {
        description: "Forbidden",
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
  contentType: z.string(),
  fileExtension: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = await requireUser(event, [
    "developer",
    "admin",
    "chief_adjudicator",
    "organizer",
    "junior_organizer",
  ]);

  const body = await readValidatedBody(event, bodySchema.parse);

  const guid = crypto.randomUUID();
  const objectKey = `events/files/${user.id}-${guid}.${body.fileExtension}`;

  const uploadUrl = await getPresignedUploadUrl(objectKey, body.contentType);

  const publicUrl = getPublicFileUrl(objectKey);

  return {
    uploadUrl,
    key: objectKey,
    publicUrl,
  };
});
