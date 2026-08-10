import { createReadStream, existsSync } from "node:fs";
import path from "node:path";

export default defineEventHandler(async (event) => {
  const key = event.context.params?.key;
  if (!key) throw createError({ statusCode: 400, statusMessage: "Missing key" });

  const filePath = path.join(process.cwd(), ".data/uploads", key);

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: "File not found" });
  }

  // Stream local disk file back to frontend
  return sendStream(event, createReadStream(filePath));
});
