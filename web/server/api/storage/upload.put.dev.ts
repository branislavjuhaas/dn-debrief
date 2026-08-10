import { promises as fs } from "node:fs";
import path from "node:path";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const key = query.key as string;

  if (!key) throw createError({ statusCode: 400, statusMessage: "Missing key" });

  const body = await readRawBody(event);
  if (!body) throw createError({ statusCode: 400, statusMessage: "No file body" });

  // Compute local disk path
  const filePath = path.join(process.cwd(), ".data/uploads", key);

  // Ensure local folder structure exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  // Save file bytes directly to local disk
  await fs.writeFile(filePath, body);

  return { success: true, key };
});
