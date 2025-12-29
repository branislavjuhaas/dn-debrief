import * as z from "zod";
import { clubs, events, users } from "hub:db:schema";
import { ilike } from "drizzle-orm";

const searchQuerySchema = z.object({
  term: z.string(),
  users: z.preprocess((val) => {
    if (val === undefined) return true;
    if (typeof val === "string") {
      if (val === "true") return true;
      if (val === "false") return false;
    }
    return val;
  }, z.boolean()),
  clubs: z.preprocess((val) => {
    if (val === undefined) return true;
    if (typeof val === "string") {
      if (val === "true") return true;
      if (val === "false") return false;
    }
    return val;
  }, z.boolean()),
  events: z.preprocess((val) => {
    if (val === undefined) return true;
    if (typeof val === "string") {
      if (val === "true") return true;
      if (val === "false") return false;
    }
    return val;
  }, z.boolean()),
});

export default defineEventHandler(async (event) => {
  await useAuth(event, ["admin", "developer"]);

  // Normalize query parameters.
  const query = await getValidatedQuery(event, (data) =>
    searchQuerySchema.parse(data),
  );

  const term = `%${useSearch(query.term)}%`;

  const usersData = query.users
    ? await db
        .select({
          id: users.id,
          name: users.name,
          surname: users.surname,
          role: users.role,
          image: users.image,
        })
        .from(users)
        .where(ilike(users.search, term))
        .limit(10)
    : undefined;

  const clubsData = query.clubs
    ? await db
        .select({
          id: clubs.id,
          name: clubs.name,
        })
        .from(clubs)
        .where(ilike(clubs.search, term))
        .limit(10)
    : undefined;

  const eventsData = query.events
    ? await db
        .select({
          id: events.id,
          name: events.name,
          season: events.season,
        })
        .from(events)
        .where(ilike(events.search, term))
        .limit(10)
    : undefined;

  return {
    success: true,
    statusCode: 200,
    data: {
      users: usersData,
      clubs: clubsData,
      events: eventsData,
    },
  };
});
