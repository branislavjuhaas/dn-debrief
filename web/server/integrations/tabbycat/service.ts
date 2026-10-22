import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import {
  createError,
  getHeader,
  getRequestURL,
  getRouterParam,
  isError,
  readBody,
  setHeader,
  type H3Event,
} from "h3";
import { z } from "zod";
import { db } from "#server/db";
import { requireUser } from "#server/utils/auth";
import { isPlatformRegistration } from "#shared/utils/events";
import type {
  ImportOperation,
  ImportPlan,
  ImportPreview,
} from "#shared/types/tabbycat";
import {
  TabbycatClient,
  TabbycatError,
  normalizeOrigin,
  collections,
  collectionPath,
} from "./client";
import {
  buildPlan,
  canonical,
  classifyRole,
  resolveRefs,
  type SourceParticipant,
} from "./plan";

const connectionSchema = z.object({
  server: z.string().trim().min(1).max(2048),
  token: z.string().trim().min(1).max(512),
});
const previewSchema = connectionSchema.extend({
  tournament: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-zA-Z0-9_-]+$/),
});
const importSchema = previewSchema.extend({
  fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  acknowledgeMixedTeams: z.boolean().default(false),
});
const hash = (value: unknown) =>
  createHash("sha256").update(canonical(value)).digest("hex");

export async function importContext(event: H3Event) {
  setHeader(event, "Cache-Control", "no-store");
  const origin = getHeader(event, "origin");
  if (
    getHeader(event, "sec-fetch-site") === "cross-site" ||
    (origin &&
      origin !==
        getRequestURL(event, { xForwardedHost: true, xForwardedProto: true })
          .origin)
  )
    throw createError({
      statusCode: 403,
      message: "Požiadavka musí pochádzať z Debriefu.",
    });
  await requireUser(event, [
    "developer",
    "admin",
    "chief_adjudicator",
    "organizer",
    "junior_organizer",
  ]);
  const slug = getRouterParam(event, "slug") ?? "";
  const record = await db.query.events.findFirst({ where: { slug } });
  if (!record)
    throw createError({ statusCode: 404, message: "Podujatie neexistuje." });
  if (!isPlatformRegistration(record.registrationConfig))
    throw createError({
      statusCode: 400,
      message: "Podujatie nepoužíva registrácie v Debriefe.",
    });
  return record;
}

async function body<T>(event: H3Event, schema: z.ZodType<T>): Promise<T> {
  if (Number(getHeader(event, "content-length") ?? 0) > 8192)
    throw createError({ statusCode: 413, message: "Príliš veľká požiadavka." });
  const parsed = schema.safeParse(await readBody(event));
  if (!parsed.success)
    throw createError({
      statusCode: 400,
      message: "Skontrolujte adresu, token a výber turnaja.",
    });
  return parsed.data;
}

export async function loadSource(
  record: Awaited<ReturnType<typeof importContext>>,
): Promise<SourceParticipant[]> {
  if (!isPlatformRegistration(record.registrationConfig)) return [];
  const season = Number(
    new Intl.DateTimeFormat("en", {
      timeZone: "Europe/Prague",
      year: "numeric",
    }).format(record.beginning),
  );
  const roles = new Map(
    record.registrationConfig.roles.map((role) => [role.uuid, role]),
  );
  const registrations = await db.query.eventRegistrations.findMany({
    where: { eventId: record.id },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          surname: true,
          email: true,
          phone: true,
          credential: true,
        },
        with: {
          clubMemberships: {
            where: { season, confirmed: true },
            with: { club: true },
          },
        },
      },
    },
    orderBy: (reg, { asc }) => [asc(reg.id)],
  });
  return registrations.map((registration) => {
    const role = roles.get(registration.registrationData.roleUuid);
    if (!role)
      throw createError({
        statusCode: 400,
        message: `Registrácia #${registration.id} má neznámu rolu. Najprv ju opravte.`,
      });
    const credential = registration.user?.credential ?? 0;
    const club = registration.user?.clubMemberships[0]?.club;
    const contact = (field: "name" | "surname" | "email" | "phone") =>
      (
        registration.user?.[field] ||
        registration.collectedDetails[field] ||
        ""
      ).trim();
    return {
      id: registration.id,
      role: classifyRole(role, credential),
      roleName: role.name,
      name: contact("name"),
      surname: contact("surname"),
      email: contact("email"),
      phone: contact("phone"),
      credential,
      teamName: registration.registrationData.teamName?.trim() ?? "",
      club: club ? { id: club.id, name: club.name } : null,
    };
  });
}

async function verifyCapabilities(
  client: TabbycatClient,
  slug: string,
  plan: ImportPlan,
) {
  const paths = new Map<string, ImportOperation[]>();
  for (const op of plan.operations) {
    const path = collectionPath(op.entity, slug);
    paths.set(path, [...(paths.get(path) ?? []), op]);
  }
  for (const [path, operations] of paths)
    await client.capabilities(path, operations);
}

export async function connect(event: H3Event) {
  await importContext(event);
  const input = await body(event, connectionSchema);
  const client = new TabbycatClient(normalizeOrigin(input.server), input.token);
  await client.authenticate();
  const tournaments = await client.list("/api/v1/tournaments");
  return {
    origin: client.origin,
    tournaments: tournaments.map((item) => {
      if (typeof item.slug !== "string" || typeof item.name !== "string")
        throw new TabbycatError("Tabbycat vrátil neplatný turnaj.");
      return { slug: item.slug, name: item.name };
    }),
  };
}

async function prepare(
  client: TabbycatClient,
  source: SourceParticipant[],
  slug: string,
) {
  const [tournament, remote] = await Promise.all([
    client.request("GET", `/api/v1/tournaments/${encodeURIComponent(slug)}`),
    client.state(slug),
  ]);
  const name = (tournament as { name?: string })?.name;
  if (typeof name !== "string")
    throw new TabbycatError("Cieľový turnaj neexistuje.");
  const plan = buildPlan(source, remote, slug);
  const preview: ImportPreview = {
    origin: client.origin,
    tournament: slug,
    tournamentName: name,
    fingerprint: fingerprint(client.origin, slug, source, plan),
    plan,
  };
  return { preview, remote };
}

function fingerprint(
  origin: string,
  slug: string,
  source: SourceParticipant[],
  plan: ImportPlan,
) {
  return hash({
    origin,
    slug,
    source,
    operations: plan.operations,
    errors: plan.errors,
  });
}

export async function preview(event: H3Event) {
  const record = await importContext(event);
  const input = await body(event, previewSchema);
  const client = new TabbycatClient(normalizeOrigin(input.server), input.token);
  await client.authenticate();
  const { preview: result } = await prepare(
    client,
    await loadSource(record),
    input.tournament,
  );
  if (!result.plan.errors.length && result.plan.operations.length)
    await verifyCapabilities(client, input.tournament, result.plan);
  return result;
}

export async function execute(event: H3Event) {
  const record = await importContext(event);
  const input = await body(event, importSchema);
  const client = new TabbycatClient(normalizeOrigin(input.server), input.token);
  await client.authenticate();
  const source = await loadSource(record);
  // A transaction-scoped advisory lock needs no tables and also covers shared institutions.
  return db.transaction(async (tx) => {
    const lockId = BigInt.asIntN(
      64,
      BigInt(`0x${hash(client.origin).slice(0, 16)}`),
    ).toString();
    const [lock] = await tx
      .select({
        locked: sql<boolean>`pg_try_advisory_xact_lock(${lockId}::bigint)`,
      })
      .from(sql`(SELECT 1) AS import_lock`);
    if (!lock?.locked)
      throw createError({
        statusCode: 409,
        message:
          "Na tomto serveri už prebieha import. Skúste znova po jeho dokončení.",
      });
    const { preview: current, remote } = await prepare(
      client,
      source,
      input.tournament,
    );
    if (current.fingerprint !== input.fingerprint)
      throw createError({
        statusCode: 409,
        message:
          "Registrácie alebo údaje v Tabbycate sa zmenili. Zobrazte nový náhľad.",
      });
    const { plan } = current;
    if (
      plan.errors.length ||
      (plan.mixedTeams.length && !input.acknowledgeMixedTeams)
    )
      throw createError({
        statusCode: 400,
        message: "Najprv opravte chyby a skontrolujte zmiešané tímy.",
      });
    await verifyCapabilities(client, input.tournament, plan);
    let completed = 0;
    try {
      // Keep requests short for large tournaments; each batch validates the remaining preview.
      for (const operation of plan.operations.slice(0, 5)) {
        const desired = resolveRefs(operation.body, plan.links) as Record<
          string,
          unknown
        >;
        const response = (await client.request(
          operation.method,
          operation.path,
          desired,
        )) as Record<string, unknown>;
        if (
          !response ||
          Object.entries(desired).some(
            ([field, value]) => canonical(response[field]) !== canonical(value),
          )
        )
          throw new TabbycatError(
            "Tabbycat nepotvrdil uloženie požadovaných údajov.",
          );
        const url = (response as { url?: unknown })?.url;
        if (typeof url !== "string")
          throw new TabbycatError("Tabbycat nevrátil odkaz na uložený záznam.");
        const path = client.path(url);
        const collection = collectionPath(operation.entity, input.tournament);
        if (
          !path.startsWith(`${collection}/`) ||
          path.slice(collection.length + 1).includes("/") ||
          path.includes("?") ||
          (operation.method === "PATCH" && path !== operation.path)
        )
          throw new TabbycatError(
            "Tabbycat vrátil neplatný odkaz na uložený záznam.",
          );
        const records = remote[collections[operation.entity]];
        const saved = { ...(response as Record<string, unknown>), url: path };
        if (operation.method === "POST") records.push(saved);
        else
          records.splice(
            records.findIndex((item) => item.url === operation.path),
            1,
            saved,
          );
        plan.links[operation.key] = path;
        completed++;
      }
    } catch (error) {
      const detail =
        error instanceof TabbycatError
          ? error.message
          : "Spojenie bolo prerušené.";
      throw createError({
        statusCode: 502,
        message: `Potvrdených zmien v tejto dávke: ${completed}. ${detail} Pred ďalším importom zobrazte nový náhľad a overte posledný záznam v Tabbycate.`,
      });
    }
    // Derive the next fingerprint from confirmed responses, without accepting unrelated changes.
    const remainingPlan = buildPlan(source, remote, input.tournament);
    return {
      completed,
      remaining: remainingPlan.operations.length,
      fingerprint: fingerprint(
        client.origin,
        input.tournament,
        source,
        remainingPlan,
      ),
    };
  });
}

export function importHandler(handler: (event: H3Event) => Promise<unknown>) {
  return async (event: H3Event) => {
    try {
      return await handler(event);
    } catch (error) {
      if (error instanceof TabbycatError || isError(error))
        throw createError({
          statusCode: error instanceof TabbycatError ? 400 : error.statusCode,
          message: error.message,
          data: { message: error.message },
        });
      throw error;
    }
  };
}
