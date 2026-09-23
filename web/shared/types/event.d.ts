import type { events } from "#server/db/schema/events";
import type { UserRole } from "./user";

export type Event = Omit<
  SerializeInferredDates<typeof events.$inferSelect>,
  "address"
> & {
  address: string;
  organizers:
    | Array<{
        id: number;
        name: string;
        surname: string;
        role: UserRole;
        email: string;
        phone: string;
        image: string | null;
      }>
    | Array<{
        id: number;
      }>;
};
