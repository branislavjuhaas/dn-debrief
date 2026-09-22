import { z } from "zod";
import { leagueEnum, regionEnum } from "#server/db/schema/clubs";
import type { Schedule } from "#server/db/schema/events";

export const motionSchema = z.object({
  text: z.string().min(1),
  href: z.url().optional(),
});

export const scheduleSchema = z.object({
  days: z.array(
    z.object({
      date: z.iso.date(),
      schedule: z.array(
        z.object({
          beginning: z.number().int().min(0).max(1439),
          duration: z.number().int().positive(),
          text: z.string().min(1),
        }),
      ),
    }),
  ),
});

export const registrationQuestionSchema = z.discriminatedUnion("type", [
  z.object({
    uuid: z.uuid(),
    title: z.string().min(1),
    description: z.string().optional(),
    required: z.boolean(),
    type: z.enum(["text", "date", "number", "boolean"]),
    deleted: z.boolean().optional(),
  }),
  z.object({
    uuid: z.uuid(),
    title: z.string().min(1),
    description: z.string().optional(),
    required: z.boolean(),
    type: z.enum(["select", "multiselect"]),
    options: z.array(z.string().min(1)).min(1),
    deleted: z.boolean().optional(),
  }),
]);

export const registrationRuleSchema = z.union([
  z.object({
    questionUuid: z.uuid(),
    operator: z.enum(["equals", "not_equals"]),
    value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
    thenUuid: z.uuid(),
  }),
  z.object({
    questionUuid: z.uuid(),
    operator: z.enum(["in", "not_in"]),
    value: z.array(z.union([z.string(), z.number()])).min(1),
    thenUuid: z.uuid(),
  }),
]);

export const registrationSectionSchema = z.object({
  uuid: z.uuid(),
  title: z.string().min(1),
  questions: z.array(registrationQuestionSchema),
  visibleWhen: z.array(registrationRuleSchema).optional(),
  deleted: z.boolean().optional(),
});

export const registrationRoleSchema = z.object({
  uuid: z.uuid(),
  name: z.string().min(1),
  cost: z.number().min(0),
  credentialRequirements: z.enum(["none", "adjudicator", "non-adjudicator"]),
  roleType: z.enum(["contestant", "adjudicator", "other"]),
  hardDeadline: z.iso.date().optional(),
  deleted: z.boolean().optional(),
});

export const registrationConfigSchema = z.union([
  z.object({ deadline: z.iso.datetime(), href: z.url() }),
  z.object({
    roles: z.array(registrationRoleSchema),
    requireAccount: z.boolean(),
    requireMembership: z.boolean(),
    softDeadline: z.iso.date().optional(),
    collectedDetails: z.array(
      z.enum([
        "name",
        "surname",
        "email",
        "phone",
        "birthDate",
        "street",
        "postalCode",
        "town",
      ]),
    ),
    sections: z.array(registrationSectionSchema),
    conditionalStartSections: z
      .array(z.object({ roleUuid: z.uuid(), sectionUuid: z.uuid() }))
      .optional(),
    fallbackStartSection: z.uuid(),
  }),
]);

export const eventSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["tournament", "workshop", "other"]),
  description: z.string(),
  fileUrls: z.array(z.url()).default([]),
  thumbnailUrl: z.url().optional(),
  beginning: z.iso.datetime().transform((val) => new Date(val)),
  end: z.iso.datetime().transform((val) => new Date(val)),
  targetLeague: z.enum(["junior", "senior", "university"]).optional(),
  targetRegion: z.enum(["western", "central", "eastern"]).optional(),
  place: z.string(),
  address: z.string(),
  motion: motionSchema.optional(),
  schedule: scheduleSchema.optional(),
  registrationConfig: registrationConfigSchema,
});

export const insertEventSchema = eventSchema.extend({
  organizers: z.array(z.number()).default([]),
});

export const updateEventSchema = eventSchema.partial();

export type ScheduleBounds = {
  beginning: Date | null;
  end: Date | null;
};

/**
 * Returns the earliest start datetime and latest end datetime across all parts in a schedule.
 */
export const getScheduleBounds = (schedule: Schedule): ScheduleBounds => {
  let minStart: Date | null = null;
  let maxEnd: Date | null = null;

  for (const day of schedule.days) {
    if (!day.date || !day.schedule || day.schedule.length === 0) {
      continue;
    }

    const [year, month, dateNum] = day.date.split("-").map(Number);

    if (!year || !month || !dateNum) {
      continue;
    }

    for (const part of day.schedule) {
      // JavaScript Date constructor automatically handles minute overflow into hours/days
      const partStart = new Date(
        year,
        month - 1,
        dateNum,
        0,
        part.beginning,
        0,
      );
      const partEnd = new Date(
        year,
        month - 1,
        dateNum,
        0,
        part.beginning + part.duration,
        0,
      );

      if (!minStart || partStart < minStart) {
        minStart = partStart;
      }
      if (!maxEnd || partEnd > maxEnd) {
        maxEnd = partEnd;
      }
    }
  }

  return { beginning: minStart, end: maxEnd };
};
