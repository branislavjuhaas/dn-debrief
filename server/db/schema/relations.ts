import { defineRelations } from "drizzle-orm";
import { users, legalGuardians } from "./auth";
import { clubs, clubMemberships, clubManagers } from "./clubs";
import { payments } from "./payments";
import {
  eventOrganizers,
  eventRegistrations,
  events,
} from "./events";

export const relations = defineRelations(
  {
    users,
    legalGuardians,
    clubs,
    clubMemberships,
    clubManagers,
    payments,
    events,
    eventRegistrations,
    eventOrganizers,
  },
  (r) => ({
    users: {
      legalGuardians: r.many.legalGuardians({
        from: r.users.id,
        to: r.legalGuardians.userId,
      }),
      payments: r.many.payments({
        from: r.users.id,
        to: r.payments.userId,
      }),
      memberships: r.many.clubMemberships({
        from: r.users.id,
        to: r.clubMemberships.userId,
      }),
      clubs: r.many.clubs({
        from: r.users.id.through(r.clubMemberships.userId),
        to: r.clubs.id.through(r.clubMemberships.clubId),
        alias: "member",
      }),
      managedClubs: r.many.clubs({
        from: r.users.id.through(r.clubManagers.userId),
        to: r.clubs.id.through(r.clubManagers.clubId),
        alias: "manager",
      }),
      eventRegistrations: r.many.eventRegistrations({
        from: r.users.id,
        to: r.eventRegistrations.userId,
      }),
      eventsOrganized: r.many.events({
        from: r.users.id.through(r.eventOrganizers.userId),
        to: r.events.id.through(r.eventOrganizers.eventId),
      }),
    },
    legalGuardians: {
      user: r.one.users({
        from: r.legalGuardians.userId,
        to: r.users.id,
      }),
    },
    clubs: {
      memberships: r.many.clubMemberships({
        from: r.clubs.id,
        to: r.clubMemberships.clubId,
      }),
      members: r.many.users({
        from: r.clubs.id.through(r.clubMemberships.clubId),
        to: r.users.id.through(r.clubMemberships.userId),
        alias: "member",
      }),
      managers: r.many.users({
        from: r.clubs.id.through(r.clubManagers.clubId),
        to: r.users.id.through(r.clubManagers.userId),
        alias: "manager",
      }),
    },
    clubMemberships: {
      club: r.one.clubs({
        from: r.clubMemberships.clubId,
        to: r.clubs.id,
      }),
      user: r.one.users({
        from: r.clubMemberships.userId,
        to: r.users.id,
      }),
      payment: r.one.payments({
        from: r.clubMemberships.paymentId,
        to: r.payments.id,
        optional: true,
      }),
    },
    clubManagers: {
      club: r.one.clubs({
        from: r.clubManagers.clubId,
        to: r.clubs.id,
      }),
      user: r.one.users({
        from: r.clubManagers.userId,
        to: r.users.id,
      }),
    },
    payments: {
      user: r.one.users({
        from: r.payments.userId,
        to: r.users.id,
      }),
      clubMemberships: r.many.clubMemberships({
        from: r.payments.id,
        to: r.clubMemberships.paymentId,
      }),
      eventRegistrations: r.many.eventRegistrations({
        from: r.payments.id,
        to: r.eventRegistrations.paymentId,
      }),
    },
    events: {
      organizers: r.many.users({
        from: r.events.id.through(r.eventOrganizers.eventId),
        to: r.users.id.through(r.eventOrganizers.userId),
      }),
      registrations: r.many.eventRegistrations({
        from: r.events.id,
        to: r.eventRegistrations.eventId,
      }),
    },
    eventRegistrations: {
      event: r.one.events({
        from: r.eventRegistrations.eventId,
        to: r.events.id,
      }),
      user: r.one.users({
        from: r.eventRegistrations.userId,
        to: r.users.id,
      }),
      payment: r.one.payments({
        from: r.eventRegistrations.paymentId,
        to: r.payments.id,
        optional: true,
      }),
    },
    eventOrganizers: {
      event: r.one.events({
        from: r.eventOrganizers.eventId,
        to: r.events.id,
      }),
      user: r.one.users({
        from: r.eventOrganizers.userId,
        to: r.users.id,
      }),
    },
  }),
);
