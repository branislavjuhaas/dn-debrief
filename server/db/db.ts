import { drizzle } from "drizzle-orm/postgres-js";
import * as auth from "./schema/auth";
import * as clubs from "./schema/clubs";
import * as payments from "./schema/payments";
import * as events from "./schema/events";
import * as settings from "./schema/settings";

import { relations } from "./schema/relations";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...auth, ...clubs, ...payments, ...events, ...settings },
  relations,
});
