import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import * as authSchema from "./schema/auth";
import * as clubsSchema from "./schema/clubs";
import * as eventsSchema from "./schema/events";

export const db = drizzle(process.env.DATABASE_URL as string, {
  schema: { ...authSchema, ...clubsSchema, ...eventsSchema },
  mode: "default",
});
