import type { Club } from "./club.ts";

export const Role = {
  Admin: "admin",
  Cap: "cap",
  Coach: "coach",
  Developer: "developer",
  Junior: "junior",
  Motion: "motion",
  Organizer: "organizer",
  User: "user",
} as const;

export type Supervisor = {
  fullName: string;
  email: string;
};

export type Season = {
  year: number;
  confirmed: boolean;
};

export type Role = (typeof Role)[keyof typeof Role];

export type User = {
  id: string;
  email: string;
  name: string;
  surname: string;
  role?: Role;
  club?: Club;
  address?: string;
  phone?: string;
  birthDate?: Date;
  supervisor?: Supervisor;
  seasons?: Season[];
  clubManager?: boolean;
  dev?: boolean;
  cookies?: boolean;
  createdAt: Date;
};
