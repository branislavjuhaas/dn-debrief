import { afterAll, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createApp, defineEventHandler, toWebHandler, type H3Event } from "h3";
import { sql } from "drizzle-orm";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import type { PGlite } from "@electric-sql/pglite";
import type { ImportPreview } from "../shared/types/tabbycat";
import {
  TabbycatClient,
  TabbycatError,
  type RemoteObject,
} from "../server/integrations/tabbycat/client";

vi.mock("#server/db", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { pg_trgm } = await import("@electric-sql/pglite/contrib/pg_trgm");
  const { unaccent } = await import("@electric-sql/pglite/contrib/unaccent");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const { relations } = await import("#server/db/schema/relations");
  const client = new PGlite({ extensions: { pg_trgm, unaccent } });
  const db = drizzle({ client, relations });
  await migrate(db, { migrationsFolder: "./server/db/migrations" });
  return { db };
});

const access = vi.hoisted(() => ({ allowed: true, userId: 1 }));
vi.mock("#server/utils/auth", () => ({
  requireUser: async () => {
    if (!access.allowed)
      throw Object.assign(new Error("Forbidden"), { statusCode: 403 });
    return { id: access.userId };
  },
}));

import { db } from "#server/db";
import { relations } from "#server/db/schema/relations";
import { users } from "#server/db/schema/auth";
import { clubs, clubMemberships } from "#server/db/schema/clubs";
import { eventRegistrations, events } from "#server/db/schema/events";
import {
  connect,
  execute,
  importHandler,
  preview,
} from "#server/integrations/tabbycat/service";

const testDb = db as PgliteDatabase<typeof relations> & { $client: PGlite };
const collections = new Map<string, RemoteObject[]>();
const writes: {
  method: string;
  path: string;
  body: Record<string, unknown>;
}[] = [];
let loseWriteResponse = false;

async function call(
  handler: (event: H3Event) => Promise<unknown>,
  input?: unknown,
  crossSite = false,
) {
  const app = createApp();
  app.use(
    defineEventHandler((event) => {
      event.context.params = { slug: "test" };
      return importHandler(handler)(event);
    }),
  );
  const response = await toWebHandler(app)(
    new Request("https://debrief.example/api/import", {
      method: input === undefined ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(crossSite ? { Origin: "https://attacker.example" } : {}),
      },
      ...(input === undefined ? {} : { body: JSON.stringify(input) }),
    }),
  );
  return { status: response.status, body: await response.json() };
}
const credentials = { server: "https://tabbycat.example", token: "test-token" };
const previewBody = { ...credentials, tournament: "destination" };
const createPreview = async () => {
  const response = await call(preview, previewBody);
  expect(response.status).toBe(200);
  return response.body as ImportPreview;
};
beforeEach(async () => {
  vi.restoreAllMocks();
  access.allowed = true;
  access.userId = 1;
  loseWriteResponse = false;
  writes.length = 0;
  collections.clear();
  for (const path of [
    "/api/v1/institutions",
    "/api/v1/tournaments/destination/teams",
    "/api/v1/tournaments/destination/speakers",
    "/api/v1/tournaments/destination/adjudicators",
  ])
    collections.set(path, []);
  vi.spyOn(TabbycatClient.prototype, "request").mockImplementation(
    async (method, path, payload) => {
      if (method === "GET" && path === "/api/v1/users/me")
        return { username: "tester" };
      if (method === "GET" && path === "/api/v1/tournaments/destination")
        return { name: "Test tournament" };
      if (method === "OPTIONS")
        return {
          actions: {
            POST: Object.fromEntries(
              [
                "name",
                "code",
                "reference",
                "institution",
                "institution_conflicts",
                "short_reference",
                "use_institution_prefix",
                "last_name",
                "email",
                "phone",
                "team",
                "categories",
                "team_conflicts",
                "adjudicator_conflicts",
                "base_score",
              ].map((field) => [field, { read_only: false }]),
            ),
          },
        };
      if (method === "GET") {
        if (collections.has(path))
          return structuredClone(collections.get(path));
        const record = [...collections.values()]
          .flat()
          .find((item) => item.url === path);
        if (record) return structuredClone(record);
        throw new TabbycatError("Not found", 404);
      }
      const body = payload as Record<string, unknown>;
      writes.push({ method, path, body });
      const items = collections.get(
        method === "POST" ? path : path.slice(0, path.lastIndexOf("/")),
      )!;
      let result: RemoteObject;
      if (method === "POST") {
        result = {
          email: null,
          phone: null,
          institution_conflicts: [],
          ...body,
          url: `${path}/${items.length + 1}`,
        };
        items.push(result);
      } else {
        result = items.find((item) => item.url === path)!;
        Object.assign(result, body);
      }
      if (loseWriteResponse) {
        loseWriteResponse = false;
        throw new TabbycatError("Connection lost after commit");
      }
      return structuredClone(result);
    },
  );
  await testDb.execute(sql`TRUNCATE users, events, clubs CASCADE`);
  await testDb.insert(users).values(
    [
      { id: 1, name: "Organizátor", credential: 3, role: "admin" as const },
      { id: 2, name: "Rečník", credential: 0 },
      { id: 3, name: "Shadow", credential: 0 },
      { id: 4, name: "Rozhodca", credential: 2 },
    ].map((user) => ({
      ...user,
      surname: "Test",
      email: `user${user.id}@example.com`,
    })),
  );
  await testDb
    .insert(clubs)
    .values({ id: 1, name: "Test club", league: "senior", region: "western" });
  await testDb.insert(clubMemberships).values(
    [2, 3, 4].map((userId) => ({
      userId,
      clubId: 1,
      season: 2026,
      registrationType: "senior_student" as const,
      confirmed: true,
    })),
  );
  await testDb.insert(events).values({
    id: 1,
    slug: "test",
    name: "Source event",
    type: "tournament",
    description: "Test",
    beginning: new Date("2026-11-13"),
    end: new Date("2026-11-14"),
    place: "Test",
    registrationConfig: {
      roles: [
        {
          uuid: "speaker",
          name: "Debatér/-ka",
          roleType: "contestant",
          credentialRequirements: "none",
          cost: 0,
        },
        {
          uuid: "shadow",
          name: "Shadow/ka",
          roleType: "other",
          credentialRequirements: "non-adjudicator",
          cost: 0,
        },
        {
          uuid: "judge",
          name: "Rozhodca/-kyňa",
          roleType: "adjudicator",
          credentialRequirements: "none",
          cost: 0,
        },
      ],
      requireAccount: true,
      requireMembership: true,
      collectedDetails: [],
      sections: [],
      fallbackStartSection: "start",
    },
  });
  await testDb.insert(eventRegistrations).values(
    ["speaker", "shadow", "judge"].map((roleUuid, index) => ({
      id: index + 1,
      eventId: 1,
      userId: index + 2,
      collectedDetails: {},
      confirmed: false,
      registrationData: {
        roleUuid,
        ...(roleUuid === "speaker" ? { teamName: "TEAM1" } : {}),
        questions: [
          { questionUuid: "private", answer: "Never transfer this ID number" },
        ],
      },
    })),
  );
});

afterAll(async () => {
  await testDb.$client.close();
});

const importBody = (result: ImportPreview) => ({
  ...previewBody,
  fingerprint: result.fingerprint,
  acknowledgeMixedTeams: true,
});

describe("Tabbycat import", () => {
  it("imports all registrations, omits custom answers, preserves edited scores and repeats without writes", async () => {
    const first = await createPreview();
    expect(first.plan.counts).toMatchObject({
      registrations: 3,
      speakers: 1,
      adjudicators: 2,
    });
    expect(JSON.stringify(first)).not.toContain("Never transfer");
    expect((await call(execute, importBody(first))).body.completed).toBe(5);
    const judges = collections.get(
      "/api/v1/tournaments/destination/adjudicators",
    )!;
    expect(judges.map((item) => item.base_score)).toEqual([0, 2]);
    judges[0]!.base_score = 4.5;
    expect((await createPreview()).plan.operations).toEqual([]);
    expect(judges[0]!.base_score).toBe(4.5);
  });

  it("rejects changed source and destination data before writing", async () => {
    const first = await createPreview();
    await testDb.execute(sql`UPDATE users SET phone = 'changed' WHERE id = 2`);
    expect((await call(execute, importBody(first))).status).toBe(409);
    expect(writes).toEqual([]);
    const fresh = await createPreview();
    collections.get("/api/v1/institutions")!.push({
      url: "/api/v1/institutions/99",
      name: "Test club",
      code: "SDA1",
    });
    expect((await call(execute, importBody(fresh))).status).toBe(409);
    expect(writes).toEqual([]);
  });

  it("rejects edits made to a field after its update was previewed", async () => {
    await call(execute, importBody(await createPreview()));
    await testDb.execute(
      sql`UPDATE users SET email = 'new@example.com' WHERE id = 2`,
    );
    const changes = await createPreview();
    const speaker = collections.get(
      "/api/v1/tournaments/destination/speakers",
    )![0]!;
    speaker.email = "manual@example.com";
    const count = writes.length;
    expect((await call(execute, importBody(changes))).status).toBe(409);
    expect(writes).toHaveLength(count);
    expect(speaker.email).toBe("manual@example.com");
  });

  it("does not retry a lost write response and a fresh preview finds the committed record", async () => {
    const first = await createPreview();
    loseWriteResponse = true;
    const failed = await call(execute, importBody(first));
    expect(failed.status).toBe(502);
    expect(failed.body.data.message).toContain(
      "Potvrdených zmien v tejto dávke: 0",
    );
    expect(writes).toHaveLength(1);
    const fresh = await createPreview();
    expect(
      fresh.plan.operations.some((item) => item.entity === "institution"),
    ).toBe(false);
    expect((await call(execute, importBody(fresh))).status).toBe(200);
    expect(
      writes.filter((item) => item.path === "/api/v1/institutions"),
    ).toHaveLength(1);
  });

  it("imports large lists in bounded batches and validates the next batch against approved changes", async () => {
    await testDb.insert(eventRegistrations).values(
      Array.from({ length: 12 }, (_, i) => ({
        id: 10 + i,
        eventId: 1,
        collectedDetails: {
          name: `Guest ${i}`,
          email: `guest${i}@example.invalid`,
        },
        registrationData: {
          roleUuid: "speaker",
          teamName: "TEAM1",
          questions: [],
        },
      })),
    );
    const first = await createPreview();
    let input = importBody(first);
    const batch = await call(execute, input);
    expect(batch.status).toBe(200);
    expect(batch.body.completed).toBe(5);
    input = { ...input, fingerprint: batch.body.fingerprint };
    let remaining = batch.body.remaining;
    await testDb.execute(sql`UPDATE users SET phone = 'changed' WHERE id = 2`);
    expect((await call(execute, input)).status).toBe(409);
    expect(writes).toHaveLength(5);
    await testDb.execute(sql`UPDATE users SET phone = NULL WHERE id = 2`);
    while (remaining) {
      const response = await call(execute, input);
      expect(response.status).toBe(200);
      expect(response.body.completed).toBeLessThanOrEqual(5);
      remaining = response.body.remaining;
      input = { ...input, fingerprint: response.body.fingerprint };
    }
    expect(writes).toHaveLength(first.plan.operations.length);
    expect((await createPreview()).plan.operations).toEqual([]);
  });

  it("requires authorization and same-origin requests", async () => {
    access.allowed = false;
    expect((await call(connect, credentials)).status).toBe(403);
    access.allowed = true;
    expect((await call(preview, previewBody, true)).status).toBe(403);
    expect(writes).toEqual([]);
  });
});
