import { db } from "@dn-debrief/db";
import { clubs, events, users } from "@dn-debrief/db/schema";
import { like } from "drizzle-orm";
import normalizeString from "#shared/utils/normalize-string";
import * as z from "zod";

const searchQuery = z.object({
  q: z.string(),
  users: z.stringbool().optional().default(true),
  clubs: z.stringbool().optional().default(true),
  events: z.stringbool().optional().default(true),
});

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const {
    q,
    users: queryUsers,
    clubs: queryClubs,
    events: queryEvents,
  } = await getValidatedQuery(event, searchQuery.parse);

  const normalizedQuery = normalizeString(q);

  const results = {
    users: Array<{
      id: number;
      name: string;
      surname: string;
      email?: string;
      role?: string;
      image: string | null;
    }>(),
    clubs: Array<{ id: number; name: string }>(),
    events: Array<{ id: number; name: string }>(),
  };

  if (queryUsers) {
    const userSelection = {
      id: users.id,
      name: users.name,
      surname: users.surname,
      image: users.image,
      ...(user.role && user.role !== "user"
        ? { email: users.email }
        : { role: users.role }),
    };

    results.users = await db
      .select(userSelection)
      .from(users)
      .where(like(users.search, `%${normalizedQuery}%`))
      .limit(5);
  }

  if (queryClubs) {
    results.clubs = await db
      .select({
        id: clubs.id,
        name: clubs.name,
      })
      .from(clubs)
      .where(like(clubs.search, `%${normalizedQuery}%`))
      .limit(5);
  }

  if (queryEvents) {
    results.events = await db
      .select({
        id: events.id,
        name: events.name,
      })
      .from(events)
      .where(like(events.search, `%${normalizedQuery}%`))
      .limit(5);
  }

  return { ...results };
});
