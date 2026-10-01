import type { UserRole } from "./user";

export type EventType = "tournament" | "workshop" | "other";
export type League = "junior" | "senior" | "university";
export type Region = "western" | "central" | "eastern";

export type UUID = string;

export type SchedulePart = {
  beginning: number;
  duration: number;
  text: string;
};

export type Day = {
  date: string; // YYYY-MM-DD
  schedule: SchedulePart[];
};

export type Schedule = {
  days: Day[];
};

export type RegistrationQuestion =
  | {
      uuid: UUID;
      title: string;
      description?: string;
      required: boolean;
      type: "text" | "date" | "number" | "boolean";
      deleted?: boolean;
    }
  | {
      uuid: UUID;
      title: string;
      description?: string;
      required: boolean;
      type: "select" | "multiselect";
      options: string[];
      deleted?: boolean;
    };

export type RegistrationRule =
  | {
      questionUuid: UUID;
      operator: "equals" | "not_equals";
      value: string | number | boolean | null;
      thenUuid?: UUID;
    }
  | {
      questionUuid: UUID;
      operator: "in" | "not_in";
      value: (string | number)[];
      thenUuid?: UUID;
    };

export type RegistrationSection = {
  uuid: UUID;
  title: string;
  questions: RegistrationQuestion[];
  visibleWhen?: RegistrationRule[];
  deleted?: boolean;
};

export type RegistrationRole = {
  uuid: UUID;
  name: string;
  cost: number;
  credentialRequirements: "none" | "adjudicator" | "non-adjudicator";
  roleType: "contestant" | "adjudicator" | "other";
  hasTeamVariant?: boolean;
  hardDeadline?: string; // ISO Date
  deleted?: boolean;
};

export type ExternalRegistrationConfig = {
  deadline: string; // ISO Date
  href: string;
  cost: number;
  requireMembership: boolean;
  softDeadline?: string;
  roles?: RegistrationRole[];
};

export type PlatformRegistrationConfig = {
  roles: RegistrationRole[];
  requireAccount: boolean;
  requireMembership: boolean;
  softDeadline?: string; // ISO Date
  deadline?: string;
  cost?: number;
  collectedDetails: (
    | "name"
    | "surname"
    | "email"
    | "phone"
    | "birthDate"
    | "street"
    | "postalCode"
    | "town"
  )[];
  sections: RegistrationSection[];
  conditionalStartSections?: { roleUuid: UUID; sectionUuid: UUID }[];
  fallbackStartSection: UUID;
};

export type RegistrationsConfig =
  | ExternalRegistrationConfig
  | PlatformRegistrationConfig;

export type RegistrationData = {
  roleUuid: UUID;
  teamName?: string;
  questions: {
    questionUuid: UUID;
    answer: string | string[] | number | boolean | null;
  }[];
};

export type CollectedDetails = {
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  birthDate?: string; // YYYY-MM-DD
  street?: string;
  postalCode?: string;
  town?: string;
};

export type Motion = {
  text: string;
  href?: string;
};

export type EventOrganizerDetail = {
  id: number;
  name: string;
  surname: string;
  role: UserRole;
  email: string;
  phone: string;
  image: string | null;
};

export type EventOrganizerRef = {
  id: number;
};

export type Event = {
  id: number;
  slug: string;
  name: string;
  search?: string;
  type: EventType;
  description: string;
  thumbnailUrl: string | null;
  beginning: Date | string;
  end: Date | string;
  targetLeague: League | null;
  targetRegion: Region | null;
  place: string;
  address: string;
  motion?: Motion | null;
  schedule: Schedule;
  registrationConfig: RegistrationsConfig;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizers: Array<EventOrganizerDetail> | Array<EventOrganizerRef>;
};

export type EventRegistration = {
  id: number;
  eventId: number;
  userId: number | null;
  registrationData: RegistrationData;
  collectedDetails: CollectedDetails;
  confirmed: boolean;
  paymentId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone?: string | null;
    birthDate?: string | null;
    image?: string | null;
    role?: string;
  } | null;
  payment?: {
    id: string;
    status: string;
    amount: number;
    description: string;
  } | null;
};
