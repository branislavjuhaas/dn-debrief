export type ImportEntity =
  | "institution"
  | "team"
  | "speaker"
  | "adjudicator"
  | "availability";

export interface ImportOperation {
  key: string;
  entity: ImportEntity;
  label: string;
  /** Availability uses PUT to mark available and POST to mark unavailable. */
  method: "POST" | "PATCH" | "PUT";
  path: string;
  body: Record<string, unknown>;
  before: Record<string, unknown>;
  details?: string[];
}

export interface ImportPlan {
  operations: ImportOperation[];
  links: Record<string, string>;
  errors: string[];
  warnings: string[];
  mixedTeams: { name: string; members: string[] }[];
  excluded: { role: string; count: number }[];
  counts: {
    registrations: number;
    speakers: number;
    adjudicators: number;
    teams: number;
    unchanged: number;
  };
}

/** Debrief round id → Tabbycat round sequence number. */
export type RoundMapping = Record<string, number>;

export interface ImportRounds {
  source: { id: string; label: string }[];
  remote: { seq: number; name: string }[];
  mapping: RoundMapping;
}

export interface ImportPreview {
  origin: string;
  tournament: string;
  tournamentName: string;
  plan: ImportPlan;
  /** Present only when the form has a round-absence question. */
  rounds: ImportRounds | null;
  fingerprint: string;
}

export interface ImportTournament {
  slug: string;
  name: string;
}
