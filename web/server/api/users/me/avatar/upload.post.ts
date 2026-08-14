import { db } from "#server/db";
import { users } from "#server/db/schema/auth";
import { eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Users"],
    summary: "Upload avatar",
    description: "Generate an upload URL for the authenticated user's avatar",
    responses: {
      200: {
        description: "The avatar upload URL and storage key",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                uploadUrl: {
                  type: "string",
                  format: "uri",
                  example:
                    "http://localhost:3000/api/storage/upload?key=avatars/1.jpg",
                },
                key: {
                  type: "string",
                  example: "avatars/1.jpg",
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
  const user = await requireUser(event);

  const objectKey = `avatars/${user.id}.jpg`;

  const uploadUrl = await getPresignedUploadUrl(objectKey, "image/jpeg");

  const avatarUrl = getPublicFileUrl(objectKey);
  await db.update(users).set({ image: avatarUrl }).where(eq(users.id, user.id));

  return {
    uploadUrl,
    key: objectKey,
  };
});
