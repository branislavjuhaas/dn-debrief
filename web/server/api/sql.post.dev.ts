import { db } from "#server/db";
import { sql } from "drizzle-orm";
import * as z from "zod";

defineRouteMeta({
  openAPI: {
    tags: ["SQL (Dev)"],
    summary: "Execute raw SQL",
    description:
      "Execute arbitrary SQL queries directly against the database. Restricted strictly to developer accounts.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Raw SQL statement to execute",
                example: "SELECT * FROM payments WHERE status = 'pending';",
              },
            },
            required: ["query"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "SQL execution result",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                  example: true,
                },
                rowCount: {
                  type: "integer",
                  description: "Number of affected or returned rows",
                  example: 1,
                },
                rows: {
                  type: "array",
                  description: "Returned records",
                  items: {
                    type: "object",
                    additionalProperties: true,
                  },
                },
              },
              required: ["success", "rowCount", "rows"],
            },
          },
        },
      },
      400: {
        description: "SQL syntax or execution error",
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
  query: z.string().min(1, "SQL query cannot be empty"),
});

export default defineEventHandler(async (event) => {
  const { query } = await readValidatedBody(event, bodySchema.parse);

  try {
    const result = await db.execute(sql.raw(query));

    const rows = Array.isArray(result) ? result : (result.rows ?? []);
    const rowCount = Array.isArray(result)
      ? result.length
      : "rowCount" in result
        ? result.rowCount
        : rows.length;

    return {
      success: true,
      rowCount,
      rows,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: "SQL Execution Error",
      message: error.message || "Failed to execute query",
    });
  }
});
