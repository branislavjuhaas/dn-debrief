import type { clubMemberships, clubs } from "#server/db/schema/clubs";

export type Club = SerializeInferredDates<typeof clubs.$inferSelect>;

export type ClubMembership = SerializeInferredDates<
  typeof clubMemberships.$inferSelect
> & {
  club?: Club | null;
};

/**
 * Membership state of a club member for a single season.
 *
 * - `renewed` — membership exists and is confirmed (and paid, when a fee applies)
 * - `pending_payment` — membership exists but its payment is not settled
 * - `pending_confirmation` — membership exists but the guardian has not confirmed it
 * - `not_renewed` — the member has no membership record for the season
 */
export type MembershipRenewalStatus =
  | "renewed"
  | "pending_payment"
  | "pending_confirmation"
  | "not_renewed";
