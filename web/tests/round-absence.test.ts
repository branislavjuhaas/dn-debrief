import { describe, expect, it } from "vite-plus/test";
import type { PlatformRegistrationConfig } from "../shared/types/event";
import {
  findRoundAbsenceQuestion,
  formatRoundAbsenceAnswer,
  hasValidRoundAbsenceAnswers,
  parseRoundAbsenceAnswer,
  platformRegistrationConfigSchema,
  registrationQuestionSchema,
} from "../shared/utils/events";

const [r1, r2, r3] = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
  "33333333-3333-4333-8333-333333333333",
];
const question = {
  uuid: "44444444-4444-4444-8444-444444444444",
  title: "Neúčasť",
  required: true,
  type: "round_absence" as const,
  rounds: [
    { id: r1, label: "1. kolo" },
    { id: r2, label: "2. kolo" },
  ],
};
const config = (
  questions: PlatformRegistrationConfig["sections"][number]["questions"],
): PlatformRegistrationConfig => ({
  roles: [],
  requireAccount: false,
  requireMembership: false,
  collectedDetails: [],
  sections: [
    { uuid: "55555555-5555-4555-8555-555555555555", title: "A", questions },
  ],
  fallbackStartSection: "55555555-5555-4555-8555-555555555555",
});
const answer = (value: unknown, questionUuid = question.uuid) => [
  { questionUuid, answer: value },
];

describe("round absence question", () => {
  it("allows at most one active round absence question", () => {
    expect(
      platformRegistrationConfigSchema.safeParse(config([question])).success,
    ).toBe(true);
    expect(
      platformRegistrationConfigSchema.safeParse(
        config([
          question,
          { ...question, uuid: "66666666-6666-4666-8666-666666666666" },
        ]),
      ).success,
    ).toBe(false);
  });

  it("accepts absences, attending all rounds and no answer, scoped to offered rounds", () => {
    const form = config([question]);
    for (const value of [
      { absent: [r2], rounds: [r1, r2] },
      { absent: [], rounds: [r1, r2] },
      null,
    ])
      expect(hasValidRoundAbsenceAnswers(form, answer(value), true)).toBe(true);
    for (const value of [
      { absent: [r2], rounds: [r1] },
      { absent: [], rounds: [] },
      [r1],
      "1. kolo",
    ])
      expect(hasValidRoundAbsenceAnswers(form, answer(value), true)).toBe(
        false,
      );
    // Removed rounds fail for new registrations but keep stored answers editable.
    const removed = answer({ absent: [r3], rounds: [r1, r3] });
    expect(hasValidRoundAbsenceAnswers(form, removed, true)).toBe(false);
    expect(hasValidRoundAbsenceAnswers(form, removed, false)).toBe(true);
    expect(
      hasValidRoundAbsenceAnswers(
        form,
        answer({ absent: [], rounds: [r1] }, "other"),
        false,
      ),
    ).toBe(false);
  });

  it("keeps unchanged answers from before a question changed its type editable", () => {
    const form = config([question]);
    const legacy = answer(["2. kolo", "Zúčastním sa všetkých"]);
    expect(hasValidRoundAbsenceAnswers(form, legacy, false)).toBe(false);
    expect(hasValidRoundAbsenceAnswers(form, legacy, false, legacy)).toBe(true);
    expect(
      hasValidRoundAbsenceAnswers(form, answer(["1. kolo"]), false, legacy),
    ).toBe(false);
  });

  it("formats answers by current round labels", () => {
    expect(
      formatRoundAbsenceAnswer(question, { absent: [r2], rounds: [r1, r2] }),
    ).toBe("Neúčasť: 2. kolo");
    expect(
      formatRoundAbsenceAnswer(question, { absent: [], rounds: [r1, r2] }),
    ).toBe("Zúčastním sa všetkých kôl");
    expect(formatRoundAbsenceAnswer(question, null)).toBe("");
  });
});

describe("round absence edge cases", () => {
  it("rejects malformed question definitions", () => {
    const parse = (rounds: unknown) =>
      registrationQuestionSchema.safeParse({ ...question, rounds }).success;
    expect(parse(question.rounds)).toBe(true);
    expect(parse([])).toBe(false);
    expect(parse([{ id: r1, label: "  " }])).toBe(false);
    expect(parse([{ id: "1", label: "1. kolo" }])).toBe(false);
    expect(
      parse([
        { id: r1, label: "1. kolo" },
        { id: r1, label: "2. kolo" },
      ]),
    ).toBe(false);
    // Choice questions keep their own shape and cannot carry rounds instead of options.
    expect(
      registrationQuestionSchema.safeParse({
        ...question,
        type: "multiselect",
      }).success,
    ).toBe(false);
  });

  it("ignores deleted questions and sections when finding the question", () => {
    const deleted = { ...question, deleted: true };
    const second = {
      ...question,
      uuid: "66666666-6666-4666-8666-666666666666",
    };
    expect(findRoundAbsenceQuestion(config([deleted]))).toBeUndefined();
    expect(findRoundAbsenceQuestion(config([deleted, second]))?.uuid).toBe(
      second.uuid,
    );
    expect(
      platformRegistrationConfigSchema.safeParse(config([deleted, second]))
        .success,
    ).toBe(true);
    const form = config([question]);
    form.sections[0]!.deleted = true;
    expect(findRoundAbsenceQuestion(form)).toBeUndefined();
    // Without an active question, object answers are rejected everywhere.
    expect(
      hasValidRoundAbsenceAnswers(
        form,
        answer({ absent: [], rounds: [r1] }),
        false,
      ),
    ).toBe(false);
  });

  it("rejects section conditions that depend on the round absence question", () => {
    const form = config([question]);
    form.sections.push({
      uuid: "88888888-8888-4888-8888-888888888888",
      title: "B",
      questions: [],
      visibleWhen: [
        {
          questionUuid: question.uuid,
          operator: "equals",
          value: "1. kolo",
          thenUuid: "88888888-8888-4888-8888-888888888888",
        },
      ],
    });
    expect(platformRegistrationConfigSchema.safeParse(form).success).toBe(
      false,
    );
  });

  it("rejects contradictory or duplicated answers", () => {
    for (const value of [
      { absent: [r1, r1], rounds: [r1, r2] },
      { absent: [], rounds: [r1, r1] },
      { absent: [r3], rounds: [r1, r2] },
      { absent: ["not-a-uuid"], rounds: ["not-a-uuid"] },
      { absent: [] },
      { rounds: [r1] },
    ])
      expect(parseRoundAbsenceAnswer(value)).toBeNull();
    // Unknown extra keys are stripped rather than stored.
    expect(
      parseRoundAbsenceAnswer({ absent: [], rounds: [r1], extra: true }),
    ).toEqual({ absent: [], rounds: [r1] });
  });

  it("keeps other question types and their answers working", () => {
    const text = {
      uuid: "77777777-7777-4777-8777-777777777777",
      title: "Strava",
      required: false,
      type: "text" as const,
    };
    const form = config([text, question]);
    expect(
      hasValidRoundAbsenceAnswers(
        form,
        [
          { questionUuid: text.uuid, answer: "vegetarián" },
          { questionUuid: text.uuid, answer: ["a", "b"] },
          { questionUuid: text.uuid, answer: 3 },
          { questionUuid: text.uuid, answer: true },
          { questionUuid: text.uuid, answer: null },
        ],
        true,
      ),
    ).toBe(true);
    expect(
      hasValidRoundAbsenceAnswers(
        form,
        answer({ absent: [], rounds: [r1] }, text.uuid),
        true,
      ),
    ).toBe(false);
  });

  it("formats answers that reference rounds deleted later", () => {
    expect(
      formatRoundAbsenceAnswer(question, { absent: [r3], rounds: [r1, r3] }),
    ).toBe("Neúčasť: odstránené kolo");
    expect(formatRoundAbsenceAnswer(question, ["2. kolo"])).toBe("");
  });
});
