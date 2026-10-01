import type {
  events,
  RegistrationsConfig,
  RegistrationRole,
  RegistrationSection,
  RegistrationQuestion,
  RegistrationRule,
  CollectedDetails,
  Schedule,
  Motion,
} from "#server/db/schema/events";
import type { UserRole } from "./user";

export type EventType = "tournament" | "workshop" | "other";
export type League = "junior" | "senior" | "university";
export type Region = "western" | "central" | "eastern";

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

export type Event = Omit<
  SerializeInferredDates<typeof events.$inferSelect>,
  "address"
> & {
  address: string;
  organizers: Array<EventOrganizerDetail> | Array<EventOrganizerRef>;
};

export type {
  RegistrationsConfig,
  RegistrationRole,
  RegistrationSection,
  RegistrationQuestion,
  RegistrationRule,
  CollectedDetails,
  Schedule,
  Motion,
};
