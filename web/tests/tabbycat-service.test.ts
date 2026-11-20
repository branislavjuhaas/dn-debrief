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
const availability = new Map<number, string[]>();
const tabbycat = { dropAvailabilityWrites: false, extraAvailability: "" };
const [round1, round2] = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
];

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
  availability.clear();
  tabbycat.dropAvailabilityWrites = false;
  tabbycat.extraAvailability = "";
  for (const path of [
    "/api/v1/institutions",
    "/api/v1/tournaments/destination/teams",
    "/api/v1/tournaments/destination/speakers",
    "/api/v1/tournaments/destination/adjudicators",
    "/api/v1/tournaments/destination/rounds",
  ])
    collections.set(path, []);
  vi.spyOn(TabbycatClient.prototype, "request").mockImplementation(
    async (method, path, payload) => {
      if (method === "GET" && path === "/api/v1/users/me")
        return { username: "tester" };
      if (method === "GET" && path === "/api/v1/tournaments/destination")
        return { name: "Test tournament" };
      const round = /\/rounds\/(\d+)\/availabilities\?adjudicators=true$/.exec(
        path,
      );
      if (round) {
        const seq = Number(round[1]);
        const current = new Set(availability.get(seq) ?? []);
        if (method !== "GET" && !tabbycat.dropAvailabilityWrites) {
          writes.push({ method, path, body: { participants: payload } });
          for (const item of payload as string[])
            if (method === "PUT") current.add(item);
            else current.delete(item);
          availability.set(seq, [...current]);
        }
        return [
          ...[...current].map((item) => `https://tabbycat.example${item}`),
          ...(tabbycat.extraAvailability ? [tabbycat.extraAvailability] : []),
        ];
      }
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
      sections: [
        {
          uuid: "start",
          title: "Dostupnosť",
          questions: [
            {
              uuid: "rounds",
              title: "V ktorých kolách sa nezúčastníte?",
              required: false,
              type: "round_absence",
              rounds: [
                { id: round1, label: "1. kolo" },
                { id: round2, label: "2. kolo" },
              ],
            },
          ],
        },
      ],
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
          ...(roleUuid === "shadow"
            ? [
                {
                  questionUuid: "rounds",
                  answer: { absent: [], rounds: [round1, round2] },
                },
              ]
            : roleUuid === "judge"
              ? [
                  {
                    questionUuid: "rounds",
                    answer: { absent: [round2], rounds: [round1, round2] },
                  },
                ]
              : []),
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
  rounds: result.rounds?.mapping,
  fingerprint: result.fingerprint,
  acknowledgeMixedTeams: true,
});
const addRounds = () =>
  collections.set(
    "/api/v1/tournaments/destination/rounds",
    [1, 2].map((seq) => ({
      url: `/api/v1/tournaments/destination/rounds/${seq}`,
      seq,
      name: `Round ${seq}`,
      abbreviation: `R${seq}`,
    })),
  );

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

  it("imports reviewed round availability and shows later manual differences", async () => {
    addRounds();
    const other = "/api/v1/tournaments/destination/adjudicators/99";
    availability.set(2, [other]);
    const first = await createPreview();
    expect(first.rounds).toMatchObject({
      source: [
        { id: round1, label: "1. kolo" },
        { id: round2, label: "2. kolo" },
      ],
      mapping: { [round1]: 1, [round2]: 2 },
    });
    expect(
      first.plan.operations
        .filter((item) => item.entity === "availability")
        .map((item) => [item.method, item.details]),
    ).toEqual([
      ["PUT", ["Shadow Test", "Rozhodca Test"]],
      ["PUT", ["Shadow Test"]],
    ]);
    // A pairing different from the reviewed preview is rejected before writing.
    const tampered = { ...importBody(first), rounds: { [round1]: 2 } };
    expect((await call(execute, tampered)).status).toBe(409);
    expect(writes).toEqual([]);

    let input = importBody(first);
    let remaining = first.plan.operations.length;
    while (remaining) {
      const result = await call(execute, input);
      expect(result.status).toBe(200);
      remaining = result.body.remaining;
      input = { ...input, fingerprint: result.body.fingerprint };
    }
    const [shadow, judge] = collections
      .get("/api/v1/tournaments/destination/adjudicators")!
      .map((item) => item.url);
    expect(availability.get(1)).toEqual([shadow, judge]);
    expect(availability.get(2)).toEqual([other, shadow]);
    expect((await createPreview()).plan.operations).toEqual([]);

    availability.get(2)!.push(judge!);
    const fresh = await createPreview();
    expect(fresh.plan.operations).toMatchObject([
      { method: "POST", details: ["Rozhodca Test"] },
    ]);
    // Unpaired rounds are never written.
    const unpaired = await call(preview, { ...previewBody, rounds: {} });
    expect((unpaired.body as ImportPreview).plan.operations).toEqual([]);
  });

  it("imports participants without availability while the tournament has no rounds", async () => {
    const first = await createPreview();
    expect(first.rounds).toMatchObject({ remote: [], mapping: {} });
    expect(
      first.plan.operations.some((item) => item.entity === "availability"),
    ).toBe(false);
    expect((await call(execute, importBody(first))).status).toBe(200);
  });

  it("resolves availability for adjudicators created in earlier batches", async () => {
    addRounds();
    await testDb.insert(eventRegistrations).values(
      Array.from({ length: 6 }, (_, i) => ({
        id: 20 + i,
        eventId: 1,
        collectedDetails: {
          name: `Guest judge ${i}`,
          email: `judge${i}@example.invalid`,
        },
        registrationData: {
          roleUuid: "judge",
          questions: [
            {
              questionUuid: "rounds",
              answer: { absent: [], rounds: [round1, round2] },
            },
          ],
        },
      })),
    );
    const first = await createPreview();
    expect(first.plan.operations.length).toBeGreaterThan(5);
    let input = importBody(first);
    let remaining = first.plan.operations.length;
    let batches = 0;
    while (remaining) {
      const result = await call(execute, input);
      expect(result.status).toBe(200);
      remaining = result.body.remaining;
      input = { ...input, fingerprint: result.body.fingerprint };
      batches++;
    }
    expect(batches).toBeGreaterThan(1);
    const judges = collections.get(
      "/api/v1/tournaments/destination/adjudicators",
    )!;
    expect(judges).toHaveLength(8);
    // Everyone except the judge absent in round 2 is available in both rounds.
    expect(availability.get(1)).toHaveLength(8);
    expect(availability.get(2)).toHaveLength(7);
    expect((await createPreview()).plan.operations).toEqual([]);
  });

  it("rejects stale availability, answers and rounds before writing", async () => {
    addRounds();
    const other = "/api/v1/tournaments/destination/adjudicators/99";
    // A change for an adjudicator outside Debrief does not alter the plan and stays untouched.
    const unrelated = await createPreview();
    availability.set(1, [other]);
    let input = importBody(unrelated);
    for (let remaining = 1; remaining;) {
      const result = await call(execute, input);
      expect(result.status).toBe(200);
      remaining = result.body.remaining;
      input = { ...input, fingerprint: result.body.fingerprint };
    }
    expect(availability.get(1)).toContain(other);
    const judge = collections
      .get("/api/v1/tournaments/destination/adjudicators")!
      .find((item) => item.name === "Rozhodca Test")!.url;
    await testDb.execute(
      sql`UPDATE event_registrations SET registration_data = jsonb_set(registration_data, '{questions,1,answer,absent}', '[]') WHERE id = 3`,
    );
    const count = writes.length;
    const stale = async (change: () => Promise<void> | void) => {
      const result = await createPreview();
      await change();
      expect((await call(execute, importBody(result))).status).toBe(409);
      expect(writes).toHaveLength(count);
    };
    // Manual Tabbycat edit of a Debrief adjudicator after the preview.
    await stale(() => {
      availability.get(2)!.push(judge);
    });
    availability.set(
      2,
      availability.get(2)!.filter((item) => item !== judge),
    );
    await stale(async () => {
      await testDb.execute(
        sql`UPDATE event_registrations SET registration_data = jsonb_set(registration_data, '{questions,1,answer,absent}', ${JSON.stringify([round2])}::jsonb) WHERE id = 3`,
      );
    });
    await stale(() => {
      collections.get("/api/v1/tournaments/destination/rounds")![0]!.name =
        "Opening round";
    });
    await stale(async () => {
      const [record] = await testDb
        .select({ config: events.registrationConfig })
        .from(events);
      const config = structuredClone(record!.config) as {
        sections: { questions: { rounds: { label: string }[] }[] }[];
      };
      config.sections[0]!.questions[0]!.rounds[0]!.label = "Prvé kolo";
      await testDb.update(events).set({ registrationConfig: config as never });
    });
  });

  it("rejects unknown pairings and blocks duplicate ones", async () => {
    addRounds();
    for (const rounds of [
      { "33333333-3333-4333-8333-333333333333": 1 },
      { [round1]: 7 },
    ]) {
      const result = await call(preview, { ...previewBody, rounds });
      expect(result.status).toBe(400);
      expect(result.body.data.message).toContain("Párovanie kôl");
    }
    const duplicate = await call(preview, {
      ...previewBody,
      rounds: { [round1]: 1, [round2]: 1 },
    });
    const plan = (duplicate.body as ImportPreview).plan;
    expect(plan.errors).toEqual([
      "Round 1: v Tabbycate je spárované s viacerými kolami z prihlášky.",
    ]);
    expect(
      (await call(execute, importBody(duplicate.body as ImportPreview))).status,
    ).toBe(400);
    expect(writes).toEqual([]);
  });

  it("stops when Tabbycat does not confirm an availability write", async () => {
    addRounds();
    const first = await createPreview();
    let input = importBody(first);
    // Create participants first, then let the availability write be ignored.
    const result = await call(execute, input);
    expect(result.status).toBe(200);
    input = { ...input, fingerprint: result.body.fingerprint };
    tabbycat.dropAvailabilityWrites = true;
    const failed = await call(execute, input);
    expect(failed.status).toBe(502);
    expect(failed.body.data.message).toContain(
      "Tabbycat nepotvrdil uloženie dostupnosti.",
    );
    tabbycat.dropAvailabilityWrites = false;
    const fresh = await createPreview();
    expect(
      fresh.plan.operations.every((item) => item.entity === "availability"),
    ).toBe(true);
    expect((await call(execute, importBody(fresh))).status).toBe(200);
    expect((await createPreview()).plan.operations).toEqual([]);
  });

  it("rejects availability lists pointing outside the tournament's adjudicators", async () => {
    addRounds();
    for (const url of [
      "https://tabbycat.example/api/v1/tournaments/destination/teams/1",
      "https://tabbycat.example/api/v1/tournaments/other/adjudicators/1",
      "https://attacker.example/api/v1/tournaments/destination/adjudicators/1",
    ]) {
      tabbycat.extraAvailability = url;
      const result = await call(preview, previewBody);
      expect(result.status).toBe(400);
    }
    expect(writes).toEqual([]);
  });

  it("does not request rounds when the form has no round absence question", async () => {
    collections.delete("/api/v1/tournaments/destination/rounds");
    await testDb.update(events).set({
      registrationConfig: {
        roles: [
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
      } as never,
    });
    await testDb.execute(sql`DELETE FROM event_registrations WHERE id <> 3`);
    const result = await createPreview();
    expect(result.rounds).toBeNull();
    expect(
      result.plan.operations.some((item) => item.entity === "availability"),
    ).toBe(false);
  });

  it("ignores round answers left in a section hidden for the registration", async () => {
    addRounds();
    const [record] = await testDb
      .select({ config: events.registrationConfig })
      .from(events);
    const config = structuredClone(record!.config) as {
      sections: Record<string, unknown>[];
    };
    // Only adjudicators see the section; the Shadow's stored answer is stale.
    config.sections[0]!.visibleWhen = [
      {
        questionUuid: "00000000-0000-0000-0000-000000000000",
        operator: "in",
        value: ["judge"],
        thenUuid: "start",
      },
    ];
    await testDb.update(events).set({ registrationConfig: config as never });
    const result = await createPreview();
    expect(
      result.plan.operations
        .filter((item) => item.entity === "availability")
        .map((item) => item.details),
    ).toEqual([["Rozhodca Test"]]);
  });

  it("requires authorization and same-origin requests", async () => {
    access.allowed = false;
    expect((await call(connect, credentials)).status).toBe(403);
    access.allowed = true;
    expect((await call(preview, previewBody, true)).status).toBe(403);
    expect(writes).toEqual([]);
  });
});
