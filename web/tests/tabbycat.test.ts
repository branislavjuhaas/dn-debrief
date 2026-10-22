import { describe, expect, it, vi } from "vite-plus/test";
import {
  buildPlan,
  canonical,
  classifyRole,
  resolveRefs,
  type SourceParticipant,
} from "../server/integrations/tabbycat/plan";
import {
  collections,
  isPublicAddress,
  normalizeOrigin,
  TabbycatClient,
  type RemoteObject,
  type RemoteState,
} from "../server/integrations/tabbycat/client";

const empty = (): RemoteState => ({
  institutions: [],
  teams: [],
  speakers: [],
  adjudicators: [],
});
const person = (
  id: number,
  extra: Partial<SourceParticipant> = {},
): SourceParticipant => ({
  id,
  role: "speaker",
  roleName: "Debatér/-ka",
  name: "Meno",
  surname: `Priezvisko${id}`,
  email: `user${id}@example.com`,
  phone: "+421900000000",
  credential: 0,
  teamName: "BIL1",
  club: { id: 8, name: "Bilingválne gymnázium" },
  ...extra,
});

function apply(plan: ReturnType<typeof buildPlan>, state: RemoteState) {
  const links = { ...plan.links };
  for (const operation of plan.operations) {
    const list = state[collections[operation.entity]];
    const body = resolveRefs(operation.body, links) as Record<string, unknown>;
    const current = list.find((item) => item.url === operation.path);
    const result: RemoteObject = current
      ? Object.assign(current, body)
      : {
          email: null,
          phone: null,
          institution_conflicts: [],
          ...body,
          url: `${operation.path}/${list.length + 1}`,
        };
    if (!current) list.push(result);
    links[operation.key] = result.url;
  }
  return links;
}

describe("registration mapping", () => {
  it("accepts guest full names without a separate surname", () => {
    const plan = buildPlan(
      [person(1, { name: "Hosť Celé Meno", surname: "", club: null })],
      empty(),
      "test",
    );
    expect(plan.errors).toEqual([]);
    const speaker = plan.operations.find((item) => item.entity === "speaker")!;
    expect(speaker.body.name).toBe("Hosť Celé Meno");
    expect(speaker.body).not.toHaveProperty("last_name");
  });
  it("includes only structured contestant/adjudicator roles and eligible Shadows", () => {
    const other = {
      name: "Shadow/ka",
      roleType: "other",
      credentialRequirements: "non-adjudicator",
    };
    expect(classifyRole(other, 0)).toBe("adjudicator");
    expect(classifyRole(other, 1)).toBeNull();
    expect(classifyRole({ ...other, name: "Organizátor/ka" }, 0)).toBeNull();
    expect(
      classifyRole({ ...other, credentialRequirements: "none" }, 0),
    ).toBeNull();
    expect(classifyRole({ ...other, roleType: "contestant" }, 0)).toBe(
      "speaker",
    );
  });

  it("sets scores 0–3 only when creating adjudicators", () => {
    const source = [0, 1, 2, 3].map((credential) =>
      person(credential + 1, { role: "adjudicator", credential }),
    );
    const state = empty();
    const first = buildPlan(source, state, "test");
    expect(
      first.operations
        .filter((item) => item.entity === "adjudicator")
        .map((item) => item.body.base_score),
    ).toEqual([0, 1, 2, 3]);
    apply(first, state);
    state.adjudicators.forEach((item) => {
      item.base_score = 5.5;
      item.trainee = true;
    });
    expect(buildPlan(source, state, "test").operations).toEqual([]);
  });

  it("creates participants after institutions and teams, then produces no writes on repeat", () => {
    const state = empty();
    const source = [
      person(1),
      person(2),
      person(3, { role: "adjudicator", credential: 2 }),
      person(4, { role: null, roleName: "Pozorovateľ/ka" }),
    ];
    const first = buildPlan(source, state, "test");
    expect(first.errors).toEqual([]);
    expect(first.operations.map((item) => item.entity)).toEqual([
      "institution",
      "team",
      "speaker",
      "speaker",
      "adjudicator",
    ]);
    expect(first.excluded).toEqual([{ role: "Pozorovateľ/ka", count: 1 }]);
    apply(first, state);
    expect(buildPlan(source, state, "test").operations).toEqual([]);
    source[0]!.email = "changed@example.com";
    const update = buildPlan(source, state, "test").operations;
    expect(update).toHaveLength(1);
    expect(update[0]!.body).toEqual({ email: "changed@example.com" });
    expect(update[0]!.before).toEqual({ email: "user1@example.com" });
  });

  it("imports mixed-club teams without primary affiliation and with all club conflicts", () => {
    const source = [
      person(1),
      person(2, { club: { id: 9, name: "Iný klub" } }),
    ];
    const plan = buildPlan(source, empty(), "test");
    const team = plan.operations.find((item) => item.entity === "team")!;
    expect(team.body.institution).toBeNull();
    expect(team.body.institution_conflicts).toEqual([
      { $ref: "institution:8" },
      { $ref: "institution:9" },
    ]);
    expect(plan.mixedTeams).toHaveLength(1);
  });

  it("blocks missing team names, invalid credentials and ambiguous target records", () => {
    expect(
      buildPlan([person(1, { teamName: "" })], empty(), "test").errors.join(
        " ",
      ),
    ).toContain("chýba názov tímu");
    expect(
      buildPlan([person(1, { credential: 5 })], empty(), "test").errors.join(
        " ",
      ),
    ).toContain("akreditácia");
    const state = empty();
    state.institutions = [
      {
        url: "/api/v1/institutions/1",
        name: "Bilingválne gymnázium",
        code: "A",
      },
      {
        url: "/api/v1/institutions/2",
        name: "Bilingválne gymnázium",
        code: "B",
      },
    ];
    expect(buildPlan([person(1)], state, "test").errors.join(" ")).toContain(
      "viac zhodných",
    );
  });

  it("preserves manual conflicts, categories and missing contacts", () => {
    const source = [person(1, { role: "adjudicator" })];
    const state = empty();
    apply(buildPlan(source, state, "test"), state);
    state.adjudicators[0]!.institution_conflicts = [
      "/api/v1/institutions/1",
      "/api/v1/institutions/999",
    ];
    state.adjudicators[0]!.team_conflicts = [
      "/api/v1/tournaments/test/teams/88",
    ];
    source[0]!.email = "";
    expect(buildPlan(source, state, "test").operations).toEqual([]);
  });

  it("warns on absent memberships and does not invent affiliations", () => {
    const plan = buildPlan([person(1, { club: null })], empty(), "test");
    expect(plan.warnings).toHaveLength(1);
    expect(plan.operations.some((item) => item.entity === "institution")).toBe(
      false,
    );
    expect(
      plan.operations.find((item) => item.entity === "team")!.body.institution,
    ).toBeNull();
  });

  it("compares unordered conflict lists and relative/absolute API links consistently", () => {
    expect(
      canonical([
        "https://tabbycat.sda.sk/api/v1/institutions/1",
        "/api/v1/institutions/2",
      ]),
    ).toBe(canonical(["/api/v1/institutions/2", "/api/v1/institutions/1"]));
  });
});

describe("Tabbycat connection safety", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "169.254.169.254",
    "100.64.0.1",
    "192.168.1.1",
    "198.18.0.1",
    "::1",
    "::ffff:127.0.0.1",
    "fd00::1",
    "2002:7f00:1::",
    "2001:db8::1",
    "3fff::1",
  ])("rejects non-public address %s", (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });
  it("accepts public addresses and normalizes the origin", () => {
    expect(isPublicAddress("1.1.1.1")).toBe(true);
    expect(isPublicAddress("2606:4700:4700::1111")).toBe(true);
    expect(normalizeOrigin("tabbycat.sda.sk/api/v1/")).toBe(
      "https://tabbycat.sda.sk",
    );
  });
  it.each([
    "http://example.com",
    "https://token@example.com",
    "https://example.com:8080",
    "https://example.com/tournament",
    "https://example.com?token=secret",
  ])("rejects unsafe URL %s", (url) => {
    expect(() => normalizeOrigin(url)).toThrow("Použite verejnú HTTPS adresu");
  });
  it("rejects cross-origin API links and malformed tokens", () => {
    const client = new TabbycatClient("https://example.com", "test-token");
    expect(() => client.path("https://attacker.example/api/v1/users")).toThrow(
      "nepovolený API odkaz",
    );
    expect(() => client.path("/admin")).toThrow("nepovolený API odkaz");
    expect(
      () => new TabbycatClient("https://example.com", "bad\r\ntoken"),
    ).toThrow("API token má neplatný formát.");
  });
  it("checks planned fields and enforces required fields only for new records", async () => {
    const client = new TabbycatClient("https://example.com", "token");
    const spy = vi.spyOn(client, "request").mockResolvedValue({
      actions: {
        POST: {
          name: { required: true },
          email: {},
          institution: { read_only: true },
        },
      },
    });
    const operation = buildPlan([person(1)], empty(), "test").operations.find(
      (item) => item.entity === "speaker",
    )!;
    const update = {
      ...operation,
      method: "PATCH" as const,
      body: { email: "new@example.com" },
    };
    await expect(
      client.capabilities(operation.path, [update]),
    ).resolves.toBeUndefined();
    await expect(
      client.capabilities(operation.path, [{ ...update, method: "POST" }]),
    ).rejects.toThrow("vyžaduje ďalšie údaje");
    await expect(
      client.capabilities(operation.path, [
        { ...update, body: { institution: null } },
      ]),
    ).rejects.toThrow("oprávnenie");
    spy.mockRestore();
  });

  it("follows every pagination page and rejects unexpected responses", async () => {
    const client = new TabbycatClient("https://example.com", "token");
    const spy = vi.spyOn(client, "request");
    spy.mockResolvedValueOnce({
      results: [{ url: "/api/v1/institutions/1" }],
      next: "https://example.com/api/v1/institutions?page=2",
    });
    spy.mockResolvedValueOnce({
      results: [{ url: "/api/v1/institutions/2" }],
      next: null,
    });
    expect(await client.list("/api/v1/institutions")).toHaveLength(2);
    spy.mockResolvedValueOnce({ detail: "Not authorized" });
    await expect(client.list("/api/v1/institutions")).rejects.toThrow(
      "nekompatibilný",
    );
    spy.mockResolvedValueOnce({
      results: [],
      next: "https://attacker.example/api/v1/institutions",
    });
    await expect(client.list("/api/v1/institutions")).rejects.toThrow(
      "nepovolený",
    );
    spy.mockRestore();
  });
});
