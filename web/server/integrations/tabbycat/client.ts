import type {
  ImportEntity,
  ImportOperation,
} from "../../../shared/types/tabbycat";
import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { BlockList, isIP, type LookupFunction } from "node:net";

export class TabbycatError extends Error {
  constructor(
    message: string,
    readonly status = 0,
  ) {
    super(message);
  }
}

const blocked = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["192.88.99.0", 24],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const)
  blocked.addSubnet(address, prefix, "ipv4");
const globalV6 = new BlockList();
globalV6.addSubnet("2000::", 3, "ipv6");
blocked.addSubnet("2001::", 23, "ipv6");
blocked.addSubnet("2001:db8::", 32, "ipv6");
blocked.addSubnet("2002::", 16, "ipv6");
blocked.addSubnet("3fff::", 20, "ipv6");

export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !blocked.check(address, "ipv4");
  return (
    family === 6 &&
    globalV6.check(address, "ipv6") &&
    !blocked.check(address, "ipv6")
  );
}

export function normalizeOrigin(input: string): string {
  let url: URL;
  try {
    url = new URL(
      input.includes("://") ? input.trim() : `https://${input.trim()}`,
    );
  } catch {
    throw new TabbycatError("Zadajte platnú HTTPS adresu Tabbycatu.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash ||
    !["/", "/api", "/api/", "/api/v1", "/api/v1/"].includes(url.pathname)
  ) {
    throw new TabbycatError(
      "Použite verejnú HTTPS adresu servera bez portu, prihlasovacích údajov a cesty turnaja.",
    );
  }
  return url.origin;
}

export type RemoteObject = Record<string, unknown> & { url: string };
export interface RemoteState {
  institutions: RemoteObject[];
  teams: RemoteObject[];
  speakers: RemoteObject[];
  adjudicators: RemoteObject[];
}

export const collections = {
  institution: "institutions",
  team: "teams",
  speaker: "speakers",
  adjudicator: "adjudicators",
} as const;

export const collectionPath = (entity: ImportEntity, slug: string) =>
  entity === "institution"
    ? "/api/v1/institutions"
    : `/api/v1/tournaments/${encodeURIComponent(slug)}/${collections[entity]}`;

export class TabbycatClient {
  constructor(
    readonly origin: string,
    private token: string,
  ) {
    if (!/^[a-zA-Z0-9_-]{1,512}$/.test(token))
      throw new TabbycatError("API token má neplatný formát.");
  }

  path(value: string): string {
    const url = new URL(value, this.origin);
    if (
      url.origin !== this.origin ||
      url.username ||
      url.password ||
      url.hash ||
      !url.pathname.startsWith("/api/v1/")
    ) {
      throw new TabbycatError("Tabbycat vrátil nepovolený API odkaz.");
    }
    return url.pathname + url.search;
  }

  async request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<unknown> {
    try {
      return await this.send(method, path, body);
    } catch (error) {
      if (
        method === "GET" &&
        error instanceof TabbycatError &&
        (error.status === 0 || error.status >= 500)
      )
        return this.send(method, path, body);
      throw error;
    }
  }

  private async send(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<unknown> {
    const safePath = this.path(path);
    const hostname = new URL(this.origin).hostname.replace(/^\[|\]$/g, "");
    let addresses;
    try {
      addresses = isIP(hostname)
        ? [{ address: hostname, family: isIP(hostname) }]
        : await lookupWithTimeout(hostname);
    } catch {
      throw new TabbycatError("Nepodarilo sa nájsť server Tabbycatu.");
    }
    if (
      !addresses.length ||
      addresses.some((item) => !isPublicAddress(item.address))
    )
      throw new TabbycatError(
        "Tabbycat musí byť dostupný na verejnej internetovej adrese.",
      );
    // Resolve once and connect to the validated address to prevent DNS rebinding.
    const pinned = addresses.find((item) => item.family === 4) ?? addresses[0]!;
    const pinnedLookup: LookupFunction = (_hostname, options, callback) => {
      if (options.all) callback(null, [pinned]);
      else callback(null, pinned.address, pinned.family);
    };
    return new Promise((resolve, reject) => {
      const payload = body === undefined ? undefined : JSON.stringify(body);
      const req = request(
        new URL(safePath, this.origin),
        {
          method,
          lookup: pinnedLookup,
          agent: false,
          signal: AbortSignal.timeout(8000),
          headers: {
            Authorization: `Token ${this.token}`,
            Accept: "application/json",
            ...(payload === undefined
              ? {}
              : {
                  "Content-Type": "application/json",
                  "Content-Length": Buffer.byteLength(payload),
                }),
          },
        },
        (response) => {
          const chunks: Buffer[] = [];
          let size = 0;
          response.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > 4 * 1024 * 1024)
              req.destroy(new Error("Response too large"));
            else chunks.push(chunk);
          });
          response.on("error", () =>
            reject(new TabbycatError("Spojenie s Tabbycatom bolo prerušené.")),
          );
          response.on("end", () => {
            const status = response.statusCode ?? 0;
            if (status < 200 || status >= 300) {
              const message =
                status === 401
                  ? "Tabbycat odmietol API token."
                  : status === 403
                    ? "API token nemá potrebné oprávnenia."
                    : status >= 300 && status < 400
                      ? "Server presmeroval API požiadavku. Zadajte jeho konečnú HTTPS adresu."
                      : `Tabbycat odmietol požiadavku (HTTP ${status}).`;
              reject(new TabbycatError(message, status));
              return;
            }
            try {
              resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
            } catch {
              reject(
                new TabbycatError("Tabbycat nevrátil platnú JSON odpoveď."),
              );
            }
          });
        },
      );
      req.on("error", () =>
        reject(
          new TabbycatError(
            "Tabbycat neodpovedal. Overte pripojenie a skúste pokračovať.",
          ),
        ),
      );
      req.end(payload);
    });
  }

  async list(path: string): Promise<RemoteObject[]> {
    const collection = new URL(this.path(path), this.origin).pathname;
    const result: RemoteObject[] = [];
    const seen = new Set<string>();
    let next: string | null = path;
    while (next) {
      const safe = this.path(next);
      if (
        new URL(safe, this.origin).pathname !== collection ||
        seen.has(safe) ||
        seen.size >= 100
      )
        throw new TabbycatError(
          "Neplatné alebo príliš rozsiahle stránkovanie Tabbycatu.",
        );
      seen.add(safe);
      const page = await this.request("GET", safe);
      const entries = Array.isArray(page)
        ? page
        : (page as { results?: unknown })?.results;
      if (!Array.isArray(entries))
        throw new TabbycatError("Tabbycat vrátil nekompatibilný zoznam.");
      for (const item of entries) {
        if (!item || typeof item !== "object" || typeof item.url !== "string")
          throw new TabbycatError("V odpovedi Tabbycatu chýbajú API odkazy.");
        result.push({ ...item, url: this.path(item.url) });
        const itemPath = new URL(this.path(item.url), this.origin).pathname;
        const suffix = itemPath.slice(collection.length + 1);
        if (
          !itemPath.startsWith(`${collection}/`) ||
          !suffix ||
          suffix.includes("/")
        )
          throw new TabbycatError(
            "Tabbycat vrátil odkaz mimo očakávaného zoznamu.",
          );
      }
      const candidate: unknown = Array.isArray(page)
        ? null
        : (page as { next?: unknown }).next;
      if (candidate != null && typeof candidate !== "string")
        throw new TabbycatError("Neplatné stránkovanie Tabbycatu.");
      next = candidate as string | null;
    }
    if (new Set(result.map((item) => item.url)).size !== result.length)
      throw new TabbycatError("Tabbycat vrátil duplicitné záznamy.");
    return result;
  }

  async authenticate(): Promise<void> {
    const user = (await this.request("GET", "/api/v1/users/me")) as Record<
      string,
      unknown
    >;
    if (!user || typeof user.username !== "string")
      throw new TabbycatError("API token sa nepodarilo overiť.");
  }

  async state(slug: string): Promise<RemoteState> {
    const base = `/api/v1/tournaments/${encodeURIComponent(slug)}`;
    const [institutions, teams, speakers, adjudicators] = await Promise.all([
      this.list("/api/v1/institutions"),
      this.list(`${base}/teams`),
      this.list(`${base}/speakers`),
      this.list(`${base}/adjudicators`),
    ]);
    for (const person of [...speakers, ...adjudicators]) {
      if (
        typeof person.name !== "string" ||
        !("email" in person) ||
        !("phone" in person)
      )
        throw new TabbycatError(
          "Token musí mať prístup k menám a kontaktným údajom účastníkov.",
        );
    }
    for (const team of teams) {
      if (
        typeof team.reference !== "string" ||
        !("institution" in team) ||
        !Array.isArray(team.institution_conflicts)
      )
        throw new TabbycatError("Token nemá prístup ku všetkým údajom tímov.");
    }
    for (const adj of adjudicators) {
      if (
        !("base_score" in adj) ||
        !("institution" in adj) ||
        !Array.isArray(adj.institution_conflicts)
      )
        throw new TabbycatError(
          "Token nemá prístup k skóre a konfliktom rozhodcov.",
        );
    }
    return { institutions, teams, speakers, adjudicators };
  }

  async capabilities(
    path: string,
    operations: ImportOperation[],
  ): Promise<void> {
    const metadata = (await this.request("OPTIONS", path)) as {
      actions?: {
        POST?: Record<string, { read_only?: boolean; required?: boolean }>;
      };
    };
    const writable = metadata?.actions?.POST;
    if (
      !writable ||
      operations.some((op) =>
        Object.keys(op.body).some(
          (field) => !writable[field] || writable[field].read_only,
        ),
      )
    )
      throw new TabbycatError(
        "API token nemá oprávnenie importovať všetky potrebné údaje alebo server používa nekompatibilné API.",
      );
    if (
      operations.some(
        (op) =>
          op.method === "POST" &&
          Object.entries(writable).some(
            ([field, info]) =>
              info.required && !info.read_only && !(field in op.body),
          ),
      )
    )
      throw new TabbycatError(
        "Cieľový turnaj vyžaduje ďalšie údaje, ktoré tento import neposkytuje.",
      );
  }
}

async function lookupWithTimeout(hostname: string) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      lookup(hostname, { all: true }),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error("DNS timeout")), 3000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
