import normalizeString from "../../../shared/utils/normalize-string";
import type { ImportEntity, ImportPlan } from "../../../shared/types/tabbycat";
import { collectionPath, type RemoteObject, type RemoteState } from "./client";

export interface SourceParticipant {
  id: number;
  role: "speaker" | "adjudicator" | null;
  roleName: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  credential: number;
  teamName: string;
  club: { id: number; name: string } | null;
}

export function classifyRole(
  role: { name: string; roleType: string; credentialRequirements: string },
  credential: number,
): SourceParticipant["role"] {
  if (role.roleType === "contestant") return "speaker";
  if (role.roleType === "adjudicator") return "adjudicator";
  if (
    /^shadow(?:\b|\/)/i.test(role.name.trim()) &&
    role.credentialRequirements === "non-adjudicator" &&
    credential === 0
  )
    return "adjudicator";
  return null;
}

export const fold = (value: string) =>
  value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("sk");
export const teamKey = (value: string) => normalizeString(value).toUpperCase();
export const ref = (key: string) => ({ $ref: key });

export function resolveRefs(
  value: unknown,
  links: Record<string, string>,
): unknown {
  if (Array.isArray(value))
    return value.map((item) => resolveRefs(item, links));
  if (value && typeof value === "object") {
    if ("$ref" in value && typeof value.$ref === "string") {
      const result = links[value.$ref];
      if (!result) throw new Error("Závislý záznam ešte nebol importovaný.");
      return result;
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        resolveRefs(item, links),
      ]),
    );
  }
  return value;
}

export function canonical(value: unknown): string {
  const normalize = (item: unknown): unknown => {
    if (Array.isArray(item))
      return item
        .map(normalize)
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    if (item && typeof item === "object")
      return Object.fromEntries(
        Object.entries(item)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, entry]) => [key, normalize(entry)]),
      );
    if (typeof item === "string" && /^https?:\/\//.test(item)) {
      const url = new URL(item);
      if (url.pathname.startsWith("/api/v1/")) return url.pathname;
    }
    return item;
  };
  return JSON.stringify(normalize(value));
}

export function buildPlan(
  source: SourceParticipant[],
  remote: RemoteState,
  slug: string,
): ImportPlan {
  const plan: ImportPlan = {
    operations: [],
    links: {},
    errors: [],
    warnings: [],
    mixedTeams: [],
    excluded: [],
    counts: {
      registrations: source.length,
      speakers: 0,
      adjudicators: 0,
      teams: 0,
      unchanged: 0,
    },
  };
  const used = new Map<string, string>();
  const addError = (message: string) => {
    if (!plan.errors.includes(message)) plan.errors.push(message);
  };
  const match = (
    candidates: RemoteObject[],
    label: string,
  ): RemoteObject | undefined => {
    if (candidates.length > 1)
      addError(
        `${label}: viac zhodných záznamov v Tabbycate. Opravte duplicity pred importom.`,
      );
    return candidates.length === 1 ? candidates[0] : undefined;
  };
  const add = (
    key: string,
    entity: ImportEntity,
    label: string,
    desired: Record<string, unknown>,
    existing?: RemoteObject,
    createOnly: Record<string, unknown> = {},
  ) => {
    if (existing) {
      const other = used.get(existing.url);
      if (other && other !== key)
        addError(
          `${label}: rovnaký záznam Tabbycatu zodpovedá viacerým registráciám.`,
        );
      used.set(existing.url, key);
      plan.links[key] = existing.url;
    }
    const body: Record<string, unknown> = {};
    const before: Record<string, unknown> = {};
    for (const [field, value] of Object.entries(desired)) {
      let resolved: unknown;
      try {
        resolved = resolveRefs(value, plan.links);
      } catch {
        resolved = value;
      }
      if (!existing || canonical(existing[field]) !== canonical(resolved)) {
        body[field] = value;
        if (existing) before[field] = existing[field] ?? null;
      }
    }
    if (existing && !Object.keys(body).length) {
      plan.counts.unchanged++;
      return;
    }
    plan.operations.push({
      key,
      entity,
      label,
      method: existing ? "PATCH" : "POST",
      path: existing?.url ?? collectionPath(entity, slug),
      body: existing ? body : { ...body, ...createOnly },
      before,
    });
  };
  const conflictList = (
    existing: RemoteObject | undefined,
    clubs: { id: number }[],
  ): unknown[] => {
    const values: unknown[] = Array.isArray(existing?.institution_conflicts)
      ? [...existing.institution_conflicts]
      : [];
    for (const club of clubs) {
      const key = `institution:${club.id}`;
      const url = plan.links[key];
      if (!url || !values.some((value) => canonical(value) === canonical(url)))
        values.push(ref(key));
    }
    return values;
  };

  const included = source.filter((person) => person.role);
  const exclusions = new Map<string, number>();
  for (const person of source.filter((person) => !person.role))
    exclusions.set(person.roleName, (exclusions.get(person.roleName) ?? 0) + 1);
  plan.excluded = [...exclusions].map(([role, count]) => ({ role, count }));
  const clubs = new Map<number, { id: number; name: string }>();
  for (const person of included) {
    const fullName = `${person.name} ${person.surname}`.trim();
    if (!person.name.trim() || fullName.length > 70)
      addError(
        `#${person.id}: meno je povinné; celé meno môže mať najviac 70 znakov.`,
      );
    if (person.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email))
      addError(`#${person.id}: neplatný e-mail.`);
    if (person.phone && person.phone.length > 40)
      addError(`#${person.id}: telefón môže mať najviac 40 znakov.`);
    if (![0, 1, 2, 3].includes(person.credential))
      addError(`#${person.id}: neplatná profilová akreditácia.`);
    if (person.club) clubs.set(person.club.id, person.club);
    else
      plan.warnings.push(
        `${fullName} (#${person.id}): bez potvrdeného členstva v sezóne; import bez inštitúcie.`,
      );
  }
  for (const club of clubs.values()) {
    const key = `institution:${club.id}`;
    const code = `SDA${club.id}`;
    if (club.name.length > 100)
      addError(
        `Klub „${club.name}“: názov inštitúcie môže mať najviac 100 znakov.`,
      );
    const byCode = remote.institutions.filter(
      (item) => fold(String(item.code)) === fold(code),
    );
    if (byCode.some((item) => fold(String(item.name)) !== fold(club.name)))
      addError(`Kód ${code} už používa iná inštitúcia.`);
    const existing = match(
      byCode.length
        ? byCode
        : remote.institutions.filter(
            (item) => fold(String(item.name)) === fold(club.name),
          ),
      club.name,
    );
    if (existing) {
      plan.links[key] = existing.url;
    } else
      add(key, "institution", club.name, {
        name: club.name,
        code,
      });
  }

  const groups = new Map<string, SourceParticipant[]>();
  for (const person of included.filter((person) => person.role === "speaker")) {
    plan.counts.speakers++;
    const key = teamKey(person.teamName);
    if (!key) {
      addError(
        `${person.name} ${person.surname} (#${person.id}): chýba názov tímu v základných údajoch registrácie.`,
      );
      continue;
    }
    if (person.teamName.length > 150)
      addError(`Tím „${person.teamName}“: názov môže mať najviac 150 znakov.`);
    groups.set(key, [...(groups.get(key) ?? []), person]);
  }
  const teams = new Map<string, RemoteObject | undefined>();
  for (const [normalized, members] of groups) {
    const key = `team:${normalized}`;
    const name = members[0]!.teamName.trim();
    const memberClubs = [
      ...new Map(
        members.flatMap((person) =>
          person.club ? [[person.club.id, person.club] as const] : [],
        ),
      ).values(),
    ];
    const primary =
      memberClubs.length === 1 && members.every((person) => person.club)
        ? memberClubs[0]!
        : null;
    const institutionUrl = primary
      ? plan.links[`institution:${primary.id}`]
      : null;
    const candidates = remote.teams.filter(
      (item) =>
        teamKey(String(item.reference)) === normalized &&
        canonical(item.institution) === canonical(institutionUrl),
    );
    const existing = match(candidates, `Tím ${name}`);
    if (
      primary &&
      !institutionUrl &&
      remote.teams.some(
        (item) => teamKey(String(item.reference)) === normalized,
      )
    )
      addError(
        `Tím ${name}: názov už existuje s inou inštitúciou. Overte jeho priradenie v Tabbycate.`,
      );
    teams.set(normalized, existing);
    add(
      key,
      "team",
      name,
      {
        reference: name,
        institution: primary ? ref(`institution:${primary.id}`) : null,
        institution_conflicts: conflictList(existing, memberClubs),
      },
      existing,
      { short_reference: name.slice(0, 35), use_institution_prefix: false },
    );
    if (memberClubs.length > 1)
      plan.mixedTeams.push({
        name,
        members: members.map(
          (person) =>
            `${person.name} ${person.surname} — ${person.club?.name ?? "bez klubu"}`,
        ),
      });
  }
  plan.counts.teams = groups.size;

  const sourceNames = new Set<string>();
  for (const person of included) {
    const name = `${person.name} ${person.surname}`.trim();
    const key = `${person.role}:${person.id}`;
    const institutionKey = person.club ? `institution:${person.club.id}` : null;
    const identity = `${person.role}:${person.role === "speaker" ? teamKey(person.teamName) : (person.club?.id ?? "none")}:${fold(name)}`;
    if (sourceNames.has(identity))
      addError(
        `${name}: viac registrácií s rovnakým menom v tom istom tíme alebo inštitúcii.`,
      );
    sourceNames.add(identity);
    const contact = {
      name,
      ...(person.surname ? { last_name: person.surname } : {}),
      ...(person.email ? { email: person.email } : {}),
      ...(person.phone ? { phone: person.phone } : {}),
    };
    if (person.role === "speaker") {
      const normalized = teamKey(person.teamName);
      if (!groups.has(normalized)) continue;
      const team = teams.get(normalized);
      const candidates = remote.speakers.filter(
        (item) =>
          team &&
          canonical(item.team) === canonical(team.url) &&
          fold(String(item.name)) === fold(name),
      );
      const existing = match(candidates, name);
      add(
        key,
        "speaker",
        `${name} (#${person.id})`,
        { ...contact, team: ref(`team:${normalized}`) },
        existing,
        { categories: [] },
      );
    } else {
      plan.counts.adjudicators++;
      const institution = institutionKey ? plan.links[institutionKey] : null;
      const candidates = remote.adjudicators.filter(
        (item) =>
          fold(String(item.name)) === fold(name) &&
          canonical(item.institution) === canonical(institution),
      );
      const existing = match(candidates, name);
      add(
        key,
        "adjudicator",
        `${name} (#${person.id})`,
        {
          ...contact,
          institution: institutionKey ? ref(institutionKey) : null,
          institution_conflicts: conflictList(
            existing,
            person.club ? [person.club] : [],
          ),
        },
        existing,
        {
          base_score: person.credential,
          team_conflicts: [],
          adjudicator_conflicts: [],
        },
      );
    }
  }
  return plan;
}
