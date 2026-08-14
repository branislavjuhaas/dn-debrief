import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Methodology"],
    summary: "List methodology files",
    description:
      "Get all methodology files with their authors and public URLs.",
    responses: {
      200: {
        description: "The methodology files",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                files: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      name: { type: "string" },
                      isExternal: { type: "boolean" },
                      fileUrl: { type: "string" },
                      authorId: { type: "integer" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                      publicUrl: { type: "string", format: "uri" },
                      author: {
                        type: "object",
                        properties: {
                          id: { type: "integer" },
                          name: { type: "string" },
                          surname: { type: "string" },
                          image: { type: "string", nullable: true },
                        },
                      },
                    },
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

export default defineEventHandler(async (event) => {
  await requireUser(event);

  const filesData = await db.query.methodologyFiles.findMany({
    with: {
      author: {
        columns: {
          id: true,
          name: true,
          surname: true,
          image: true,
        },
      },
    },
  });

  // Bind public URL to each file for non-external files
  const filesWithPublicUrl = filesData.map((file) => {
    if (!file.isExternal) {
      const publicUrl = getPublicFileUrl(file.fileUrl);
      return { ...file, publicUrl };
    }
    return file;
  });

  return { files: filesWithPublicUrl };
});
