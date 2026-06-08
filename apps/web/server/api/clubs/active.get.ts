import { db } from "@dn-debrief/db";

export default defineEventHandler(async (_event) => {
  const clubs = await db.query.clubs.findMany({
    columns: {
      id: true,
      name: true,
    },
    where: {
      isActive: true,
    },
  });
  return { clubs };
});
