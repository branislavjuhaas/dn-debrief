export type ImportEntity = "institution" | "team" | "speaker" | "adjudicator";

export interface ImportOperation {
  key: string;
  entity: ImportEntity;
  label: string;
  method: "POST" | "PATCH";
  path: string;
  body: Record<string, unknown>;
  before: Record<string, unknown>;
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

export interface ImportPreview {
  origin: string;
  tournament: string;
  tournamentName: string;
  plan: ImportPlan;
  fingerprint: string;
}

export interface ImportTournament {
  slug: string;
  name: string;
}
