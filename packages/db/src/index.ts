import { drizzle } from "drizzle-orm/postgres-js";
import { relations } from "./schema/relations";

export const db = drizzle(process.env.DATABASE_URL!, {
  relations,
});
