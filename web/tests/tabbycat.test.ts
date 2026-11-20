import { describe, expect, it, vi } from "vite-plus/test";
import {
  buildPlan,
  canonical,
  classifyRole,
  resolveRefs,
  suggestRounds,
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
  rounds: [],
  availability: {},
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
  availability: null,
  ...extra,
});

function apply(plan: ReturnType<typeof buildPlan>, state: RemoteState) {
  const links = { ...plan.links };
  for (const operation of plan.operations) {
    if (operation.entity === "availability") {
      const seq = Number(/rounds\/(\d+)\//.exec(operation.path)![1]);
      const listed = resolveRefs(
        operation.body.participants,
        links,
      ) as string[];
      const current = new Set(state.availability[seq] ?? []);
      for (const item of listed)
        if (operation.method === "PUT") current.add(item);
        else current.delete(item);
      state.availability[seq] = [...current];
      continue;
    }
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

describe("round availability", () => {
  const [r1, r2, r3] = [
    "11111111-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222",
    "33333333-3333-4333-8333-333333333333",
  ];
  const source = [
    { id: r1, label: "1. kolo" },
    { id: r2, label: "2. kolo" },
    { id: r3, label: "3. kolo" },
  ];
  const remoteRounds = [1, 2, 3].map((seq) => ({
    seq,
    name: `Round ${seq}`,
    abbreviation: `R${seq}`,
  }));
  const judge = (id: number, availability: SourceParticipant["availability"]) =>
    person(id, {
      role: "adjudicator",
      name: `Judge${id}`,
      credential: 2,
      availability,
    });
  const path = (seq: number) =>
    `/api/v1/tournaments/test/rounds/${seq}/availabilities?adjudicators=true`;

  it("suggests only unambiguous one-to-one round pairs", () => {
    expect(suggestRounds(source, remoteRounds)).toEqual({
      [r1]: 1,
      [r2]: 2,
      [r3]: 3,
    });
    expect(
      suggestRounds(
        [
          { id: r1, label: "R2" },
          { id: r2, label: "Druhé 2" },
          { id: r3, label: "Finále" },
        ],
        [...remoteRounds, { seq: 4, name: "Grand Final", abbreviation: "GF" }],
      ),
    ).toEqual({});
  });

  it("writes only answered, mapped rounds and keeps other Tabbycat availability", () => {
    const state = empty();
    state.rounds = remoteRounds;
    const people = [
      judge(1, { absent: [r2], rounds: [r1, r2] }),
      judge(2, null),
      judge(3, { absent: [], rounds: [r1, r2, r3] }),
    ];
    const rounds = { source, mapping: { [r1]: 1, [r2]: 2 } };
    const links = apply(buildPlan(people, state, "test"), state);
    const [one, , three] = [1, 2, 3].map((id) => links[`adjudicator:${id}`]!);
    // Manual Tabbycat state: judge 1 and an unrelated adjudicator in round 2, judge 2 in round 1.
    state.availability = {
      1: [links["adjudicator:2"]!, "/api/v1/tournaments/test/adjudicators/99"],
      2: [one!, "/api/v1/tournaments/test/adjudicators/99"],
    };
    const plan = buildPlan(people, state, "test", rounds);
    expect(plan.errors).toEqual([]);
    expect(
      plan.operations.map(({ method, path, body, details }) => ({
        method,
        path,
        body,
        details,
      })),
    ).toEqual([
      {
        method: "PUT",
        path: path(1),
        body: { participants: [one, three] },
        details: ["Judge1 Priezvisko1", "Judge3 Priezvisko3"],
      },
      {
        method: "PUT",
        path: path(2),
        body: { participants: [three] },
        details: ["Judge3 Priezvisko3"],
      },
      {
        method: "POST",
        path: path(2),
        body: { participants: [one] },
        details: ["Judge1 Priezvisko1"],
      },
    ]);
    apply(plan, state);
    expect(state.availability[1]).toContain(links["adjudicator:2"]);
    expect(state.availability[2]).toContain(
      "/api/v1/tournaments/test/adjudicators/99",
    );
    expect(buildPlan(people, state, "test", rounds).operations).toEqual([]);
    // Round 3 was added after judge 1 answered, so it stays unknown for them.
    const later = buildPlan(people, state, "test", {
      source,
      mapping: { ...rounds.mapping, [r3]: 3 },
    });
    expect(later.operations.map((item) => item.details)).toEqual([
      ["Judge3 Priezvisko3"],
    ]);
  });

  it("marks new adjudicators available by reference and blocks duplicate pairing", () => {
    const state = empty();
    state.rounds = remoteRounds;
    const people = [judge(1, { absent: [r2], rounds: [r1, r2] })];
    const plan = buildPlan(people, state, "test", {
      source,
      mapping: { [r1]: 1, [r2]: 2 },
    });
    expect(plan.operations.map((item) => item.entity)).toEqual([
      "institution",
      "adjudicator",
      "availability",
    ]);
    expect(plan.operations.at(-1)!.body).toEqual({
      participants: [{ $ref: "adjudicator:1" }],
    });
    expect(
      buildPlan(people, state, "test", {
        source,
        mapping: { [r1]: 1, [r2]: 1 },
      }).errors,
    ).toEqual([
      "Round 1: v Tabbycate je spárované s viacerými kolami z prihlášky.",
    ]);
  });
});

describe("round availability edge cases", () => {
  const ids = Array.from(
    { length: 4 },
    (_, i) =>
      `${i + 1}${i + 1}${i + 1}${i + 1}aaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa`,
  );
  const remote = [1, 2, 3].map((seq) => ({
    seq,
    name: `Round ${seq}`,
    abbreviation: `R${seq}`,
  }));
  const rounds = ids
    .slice(0, 3)
    .map((id, i) => ({ id, label: `${i + 1}. kolo` }));
  const judge = (
    id: number,
    availability: SourceParticipant["availability"],
    extra: Partial<SourceParticipant> = {},
  ) =>
    person(id, {
      role: "adjudicator",
      name: `Judge${id}`,
      credential: 2,
      availability,
      ...extra,
    });
  const all = (absent: string[] = []) => ({
    absent,
    rounds: rounds.map((round) => round.id),
  });
  const existing = (people: SourceParticipant[]) => {
    const state = empty();
    state.rounds = remote;
    const links = apply(buildPlan(people, state, "test"), state);
    return { state, links };
  };
  const pairs = (mapping: Record<string, number>) => ({
    source: rounds,
    mapping,
  });

  it("suggests by exact name or abbreviation regardless of case and spacing", () => {
    expect(
      suggestRounds(
        [
          { id: ids[0]!, label: "  round   1 " },
          { id: ids[1]!, label: "r2" },
        ],
        remote,
      ),
    ).toEqual({ [ids[0]!]: 1, [ids[1]!]: 2 });
  });

  it("leaves ambiguous, multi-number and duplicate suggestions unpaired", () => {
    const novice = [
      ...remote,
      { seq: 4, name: "Novice Round 1", abbreviation: "N1" },
    ];
    expect(suggestRounds([{ id: ids[0]!, label: "1. kolo" }], novice)).toEqual(
      {},
    );
    expect(
      suggestRounds([{ id: ids[0]!, label: "1. kolo, 2. deň" }], remote),
    ).toEqual({});
    expect(
      suggestRounds(
        [
          { id: ids[0]!, label: "1. kolo" },
          { id: ids[1]!, label: "Kolo 1" },
        ],
        remote,
      ),
    ).toEqual({});
    expect(suggestRounds(rounds, [])).toEqual({});
  });

  it("does nothing without a pairing or for unpaired rounds", () => {
    const people = [judge(1, all([ids[1]!]))];
    const { state } = existing(people);
    expect(buildPlan(people, state, "test").operations).toEqual([]);
    expect(buildPlan(people, state, "test", pairs({})).operations).toEqual([]);
    // A pairing to a round missing in Tabbycat is never written.
    expect(
      buildPlan(people, state, "test", pairs({ [ids[0]!]: 9 })).operations,
    ).toEqual([]);
  });

  it("ignores speakers, excluded roles and absences in deleted rounds", () => {
    const people = [
      person(1, { availability: all([ids[0]!]) }),
      person(2, { role: null, roleName: "Pozorovateľ", availability: all() }),
      judge(3, { absent: [ids[3]!], rounds: [ids[0]!, ids[3]!] }),
    ];
    const { state, links } = existing(people);
    const plan = buildPlan(people, state, "test", pairs({ [ids[0]!]: 1 }));
    expect(plan.operations).toMatchObject([
      {
        method: "PUT",
        body: { participants: [links["adjudicator:3"]] },
      },
    ]);
  });

  it("marks several absences and keeps rounds out of scope unchanged", () => {
    const people = [
      judge(1, all([ids[0]!, ids[2]!])),
      judge(2, { absent: [], rounds: [ids[0]!] }),
    ];
    const { state, links } = existing(people);
    state.availability = {
      1: [links["adjudicator:1"]!],
      3: [links["adjudicator:1"]!, links["adjudicator:2"]!],
    };
    const plan = buildPlan(
      people,
      state,
      "test",
      pairs({ [ids[0]!]: 1, [ids[1]!]: 2, [ids[2]!]: 3 }),
    );
    expect(
      plan.operations.map((item) => [
        item.method,
        item.path.match(/rounds\/(\d)/)![1],
        item.details,
      ]),
    ).toEqual([
      ["PUT", "1", ["Judge2 Priezvisko2"]],
      ["POST", "1", ["Judge1 Priezvisko1"]],
      ["PUT", "2", ["Judge1 Priezvisko1"]],
      ["POST", "3", ["Judge1 Priezvisko1"]],
    ]);
    // Judge 2 answered before rounds 2 and 3 existed in the form: round 3 stays available.
    apply(plan, state);
    expect(state.availability[3]).toEqual([links["adjudicator:2"]]);
  });

  it("follows a changed pairing without touching the previously paired round", () => {
    const people = [judge(1, all([ids[0]!]))];
    const { state, links } = existing(people);
    state.availability = { 1: [links["adjudicator:1"]!], 2: [] };
    const plan = buildPlan(people, state, "test", pairs({ [ids[0]!]: 2 }));
    expect(plan.operations).toEqual([]);
    const swapped = buildPlan(
      people,
      state,
      "test",
      pairs({ [ids[0]!]: 2, [ids[1]!]: 1 }),
    );
    expect(swapped.operations.map((item) => item.method)).toEqual([]);
    expect(state.availability[1]).toEqual([links["adjudicator:1"]]);
  });

  it("does not plan availability for adjudicators that cannot be matched unambiguously", () => {
    const people = [judge(1, all())];
    const state = empty();
    state.rounds = remote;
    state.institutions.push({
      url: "/api/v1/institutions/1",
      name: "Bilingválne gymnázium",
      code: "SDA8",
    });
    for (const n of [1, 2])
      state.adjudicators.push({
        url: `/api/v1/tournaments/test/adjudicators/${n}`,
        name: "Judge1 Priezvisko1",
        institution: "/api/v1/institutions/1",
        institution_conflicts: [],
        base_score: 2,
        email: null,
        phone: null,
      });
    const plan = buildPlan(people, state, "test", pairs({ [ids[0]!]: 1 }));
    expect(plan.errors).toContain(
      "Judge1 Priezvisko1: viac zhodných záznamov v Tabbycate. Opravte duplicity pred importom.",
    );
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
