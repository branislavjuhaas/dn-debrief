import { db } from "#server/db";
import { methodologyFiles } from "#server/db/schema/methodology";
import { eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["Methodology"],
    summary: "Delete methodology file",
    description:
      "Delete a methodology file record and remove its stored file when applicable.",
    parameters: [
      {
        name: "fileId",
        in: "path",
        required: true,
        schema: { type: "integer" },
        description: "The ID of the methodology file to delete",
      },
    ],
    responses: {
      204: {
        description: "Methodology file deleted successfully",
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
      404: {
        description: "Methodology file not found",
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

export default defineEventHandler(async (event) => {
  await requireUser(event, ["developer", "admin"]);
  const fileId = Number.parseInt(getRouterParam(event, "fileId") ?? "", 10);

  const deletedFiles = await db
    .delete(methodologyFiles)
    .where(eq(methodologyFiles.id, fileId))
    .returning();

  if (!deletedFiles[0]) {
    throw createError({
      statusCode: 404,
      statusMessage: "Methodology file not found",
    });
  }

  if (!deletedFiles[0].isExternal) {
    const filePath = deletedFiles[0].fileUrl; // FileUrl is the path in storage
    deleteFile(filePath).catch((err) => {
      console.error("Error deleting file from storage:", err);
    });
  }

  setResponseStatus(event, 204); // No Content
});
