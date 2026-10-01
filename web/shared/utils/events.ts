import { z } from "zod";
import type {
  Schedule,
  RegistrationSection,
  Event,
  EventType,
  League,
  Region,
  ExternalRegistrationConfig,
  PlatformRegistrationConfig,
} from "#shared/types/event";

export const EVENT_TYPES = ["tournament", "workshop", "other"] as const;
export const LEAGUES = ["junior", "senior", "university"] as const;
export const REGIONS = ["western", "central", "eastern"] as const;

export const EVENT_TYPE_OPTIONS: Array<{ label: string; value: EventType }> = [
  { label: "Turnaj", value: "tournament" },
  { label: "Seminár", value: "workshop" },
  { label: "Iný typ podujatia", value: "other" },
];

export const LEAGUE_OPTIONS: Array<{ label: string; value: League }> = [
  { label: "Základoškolský debatný program", value: "junior" },
  { label: "Stredoškolský debatný program", value: "senior" },
  { label: "Vysokoškolský debatný program", value: "university" },
];

export const REGION_OPTIONS: Array<{ label: string; value: Region | null }> = [
  { label: "Západoslovenský región", value: "western" },
  { label: "Stredoslovenský región", value: "central" },
  { label: "Východoslovenský región", value: "eastern" },
  { label: "Celoslovenské podujatie", value: null },
];

export const COLLECTED_DETAILS_OPTIONS = [
  { label: "Meno", value: "name" },
  { label: "Priezvisko", value: "surname" },
  { label: "E-mailová adresa", value: "email" },
  { label: "Telefónne číslo", value: "phone" },
  { label: "Dátum narodenia", value: "birthDate" },
  { label: "Ulica a číslo", value: "street" },
  { label: "PSČ", value: "postalCode" },
  { label: "Mesto / Obec", value: "town" },
];

export const ROLE_CONDITION_QUESTION_UUID =
  "00000000-0000-0000-0000-000000000000";

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
  hasTeamVariant: z.boolean().default(false),
  hardDeadline: z.union([z.iso.datetime(), z.iso.date()]).optional(),
  deleted: z.boolean().optional(),
});

export const externalRegistrationConfigSchema = z.object({
  deadline: z.iso.datetime(),
  href: z.url(),
  cost: z.number(),
  requireMembership: z.boolean(),
});

export const platformRegistrationConfigSchema = z
  .object({
    roles: z.array(registrationRoleSchema),
    requireAccount: z.boolean(),
    requireMembership: z.boolean(),
    softDeadline: z.union([z.iso.datetime(), z.iso.date()]).optional(),
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
  })
  .superRefine((config, ctx) => {
    const activeSections = config.sections.filter((s) => !s.deleted);
    const seenQuestionUuids = new Set<string>();

    for (let i = 0; i < activeSections.length; i++) {
      const section = activeSections[i]!;
      if (section.visibleWhen && section.visibleWhen.length > 0) {
        for (const rule of section.visibleWhen) {
          if (rule.questionUuid === ROLE_CONDITION_QUESTION_UUID) {
            continue;
          }
          if (!seenQuestionUuids.has(rule.questionUuid)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Podmienka v sekcii "${section.title}" sa odkazuje na otázku, ktorá sa nenachádza v predchádzajúcich sekciách.`,
              path: ["sections", i, "visibleWhen"],
            });
          }
        }
      }

      const activeQuestions = section.questions.filter((q) => !q.deleted);
      for (const q of activeQuestions) {
        seenQuestionUuids.add(q.uuid);
      }
    }
  });

export const registrationConfigSchema = z.union([
  externalRegistrationConfigSchema,
  platformRegistrationConfigSchema,
]);

export const eventSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(EVENT_TYPES),
  description: z.string(),
  thumbnailUrl: z.url().optional().nullable(),
  beginning: z.iso.datetime().transform((val) => new Date(val)),
  end: z.iso.datetime().transform((val) => new Date(val)),
  targetLeague: z.enum(LEAGUES).optional(),
  targetRegion: z.enum(REGIONS).optional(),
  place: z.string(),
  address: z.string(),
  motion: motionSchema.optional(),
  schedule: scheduleSchema.optional(),
  registrationConfig: registrationConfigSchema,
});

export const insertEventSchema = eventSchema.extend({
  organizers: z.array(z.number()).default([]),
});

export const updateEventSchema = eventSchema.partial().extend({
  organizers: z.array(z.number()).optional(),
});

export const isExternalRegistration = (
  config: unknown,
): config is ExternalRegistrationConfig => {
  return typeof config === "object" && config !== null && "href" in config;
};

export const isPlatformRegistration = (
  config: unknown,
): config is PlatformRegistrationConfig => {
  return typeof config === "object" && config !== null && "sections" in config;
};

export type ScheduleBounds = {
  beginning: Date | null;
  end: Date | null;
};

/**
 * Returns the earliest start datetime and latest end datetime across all parts in a schedule.
 */
export const getScheduleBounds = (
  schedule?: Schedule | null,
): ScheduleBounds => {
  if (!schedule?.days || schedule.days.length === 0) {
    return { beginning: null, end: null };
  }

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

/**
 * Formats schedule bounds into a human-readable Slovak date/time range.
 */
export const formatScheduleBounds = (bounds: ScheduleBounds): string | null => {
  if (!bounds.beginning || !bounds.end) return null;

  const b = bounds.beginning;
  const e = bounds.end;

  const dateOpts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  };
  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  const bDateStr = b.toLocaleDateString("sk-SK", dateOpts);
  const eDateStr = e.toLocaleDateString("sk-SK", dateOpts);
  const bTimeStr = b.toLocaleTimeString("sk-SK", timeOpts);
  const eTimeStr = e.toLocaleTimeString("sk-SK", timeOpts);

  if (bDateStr === eDateStr) {
    return `${bDateStr} (${bTimeStr} – ${eTimeStr})`;
  }

  return `${bDateStr} ${bTimeStr} – ${eDateStr} ${eTimeStr}`;
};

/**
 * Factory for creating fresh default event state.
 */
export const createDefaultEvent = (currentUserId?: number): Partial<Event> => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIsoDate = tomorrow.toISOString().split("T")[0]!;

  return {
    slug: "",
    name: "",
    type: "tournament",
    description: "",
    thumbnailUrl: undefined,
    beginning: undefined,
    end: undefined,
    targetLeague: undefined,
    targetRegion: undefined,
    place: "",
    address: "",
    motion: { text: "Všetky tézy tohoto turnaja sú improvizované" },
    schedule: {
      days: [
        {
          date: tomorrowIsoDate,
          schedule: [
            {
              beginning: 540, // 09:00
              duration: 30,
              text: "Otvorenie podujatia",
            },
          ],
        },
      ],
    },
    registrationConfig: {
      deadline: tomorrow.toISOString(),
      href: "",
      cost: 0,
      requireMembership: true,
    },
    organizers: currentUserId ? [{ id: currentUserId }] : [],
  };
};

/**
 * Dynamically evaluates section visibility rules based on assigned role and answers given in prior steps.
 */
export const isSectionVisible = (
  section: RegistrationSection,
  roleUuid: string,
  answers: Record<string, any>,
): boolean => {
  if (!section.visibleWhen || section.visibleWhen.length === 0) {
    return true;
  }

  return section.visibleWhen.every((rule) => {
    const rawVal =
      rule.questionUuid === ROLE_CONDITION_QUESTION_UUID
        ? roleUuid
        : answers[rule.questionUuid];

    if (rawVal === undefined || rawVal === null) {
      if (rule.operator === "not_equals") {
        return (
          rule.value !== null && rule.value !== undefined && rule.value !== ""
        );
      }
      if (rule.operator === "not_in") {
        return true;
      }
      return false;
    }

    switch (rule.operator) {
      case "equals":
        return String(rawVal) === String(rule.value);
      case "not_equals":
        return String(rawVal) !== String(rule.value);
      case "in": {
        const allowed = Array.isArray(rule.value)
          ? rule.value.map(String)
          : [String(rule.value)];
        if (Array.isArray(rawVal)) {
          return rawVal.some((v) => allowed.includes(String(v)));
        }
        return allowed.includes(String(rawVal));
      }
      case "not_in": {
        const disallowed = Array.isArray(rule.value)
          ? rule.value.map(String)
          : [String(rule.value)];
        if (Array.isArray(rawVal)) {
          return !rawVal.some((v) => disallowed.includes(String(v)));
        }
        return !disallowed.includes(String(rawVal));
      }
      default:
        return true;
    }
  });
};

export const normalizeTeamName = (rawString?: string | null): string => {
  if (!rawString) return "";
  return rawString
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
};
