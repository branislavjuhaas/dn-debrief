import { defineRelations } from 'drizzle-orm';
import { users, supervisors } from './auth';
import { clubs, clubMemberships, clubManagers } from './clubs';
import { payments } from './payments';

export const relations = defineRelations(
  { users, supervisors, clubs, clubMemberships, clubManagers, payments },
  r => ({
    users: {
      supervisors: r.many.supervisors({
        from: r.users.id,
        to: r.supervisors.userId,
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
        alias: 'member',
      }),
      managedClubs: r.many.clubs({
        from: r.users.id.through(r.clubManagers.userId),
        to: r.clubs.id.through(r.clubManagers.clubId),
        alias: 'manager',
      }),
    },
    supervisors: {
      user: r.one.users({
        from: r.supervisors.userId,
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
        alias: 'member',
      }),
      managers: r.many.users({
        from: r.clubs.id.through(r.clubManagers.clubId),
        to: r.users.id.through(r.clubManagers.userId),
        alias: 'manager',
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
    },
  }),
);
