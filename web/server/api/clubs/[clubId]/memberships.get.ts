import { db } from "#server/db";
import { clubMemberships } from "#server/db/schema/clubs";
import type { MembershipRenewalStatus } from "#shared/types/club";
import { desc, eq } from "drizzle-orm";
import * as z from "zod";

defineRouteMeta({
  openAPI: {
    tags: ["Clubs"],
    summary: "List club members and their renewal status",
    description:
      "Get all members of a specific club with their membership renewal status for the selected season.",
    parameters: [
      {
        name: "clubId",
        in: "path",
        required: true,
        description: "The ID of the club",
        schema: {
          type: "integer",
        },
      },
      {
        name: "season",
        in: "query",
        required: false,
        description:
          "Season to evaluate. Defaults to the current season when omitted.",
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      200: {
        description: "Club members with renewal status for the selected season",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                season: { type: "integer" },
                seasons: {
                  type: "array",
                  items: { type: "integer" },
                },
                summary: {
                  type: "object",
                  properties: {
                    total: { type: "integer" },
                    renewed: { type: "integer" },
                    pendingPayment: { type: "integer" },
                    pendingConfirmation: { type: "integer" },
                    notRenewed: { type: "integer" },
                  },
                  required: [
                    "total",
                    "renewed",
                    "pendingPayment",
                    "pendingConfirmation",
                    "notRenewed",
                  ],
                },
                members: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "integer" },
                          name: { type: "string" },
                          surname: { type: "string" },
                          email: { type: "string" },
                          role: {
                            type: "string",
                            enum: [
                              "user",
                              "organizer",
                              "junior_organizer",
                              "chief_adjudicator",
                              "motion_committee_member",
                              "admin",
                              "developer",
                            ],
                          },
                          image: { type: ["string", "null"] },
                        },
                      },
                      status: {
                        type: "string",
                        enum: [
                          "renewed",
                          "pending_payment",
                          "pending_confirmation",
                          "not_renewed",
                        ],
                      },
                      registrationType: {
                        type: ["string", "null"],
                        enum: [
                          "junior_student",
                          "senior_student",
                          "graduate",
                          "teacher",
                          null,
                        ],
                      },
                      confirmed: { type: ["boolean", "null"] },
                      paymentStatus: {
                        type: ["string", "null"],
                        enum: [
                          "pending",
                          "processing",
                          "paid",
                          "cancelled",
                          "forgiven",
                          "failed",
                          null,
                        ],
                      },
                    },
                  },
                },
              },
              required: ["season", "seasons", "summary", "members"],
            },
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
    },
  },
});

const querySchema = z.object({
  season: z.coerce.number().int().optional(),
});

const UNPAID_STATUSES = ["pending", "processing", "failed", "cancelled"];

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const clubId = Number.parseInt(getRouterParam(event, "clubId") ?? "", 10);

  // Check if the user is a developer or admin, or if they are the club manager
  if (!["developer", "admin"].includes(user.role)) {
    const clubManager = await db.query.clubManagers.findFirst({
      where: {
        clubId: clubId,
        userId: user.id,
      },
    });

    if (!clubManager) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "You do not have permission to view members of this club.",
      });
    }
  }

  const { season: requestedSeason } = await getValidatedQuery(
    event,
    querySchema.parse,
  );

  // The club roster is everyone who has ever been a member of this club, so
  // members who have not renewed this season are still visible.
  const roster = await db
    .selectDistinct({ userId: clubMemberships.userId })
    .from(clubMemberships)
    .where(eq(clubMemberships.clubId, clubId));

  const seasonRows = await db
    .selectDistinct({ season: clubMemberships.season })
    .from(clubMemberships)
    .where(eq(clubMemberships.clubId, clubId))
    .orderBy(desc(clubMemberships.season));

  const currentSeasons = (await getSetting("current-seasons")) ?? [];
  const seasons = [
    ...new Set([...currentSeasons, ...seasonRows.map((row) => row.season)]),
  ].sort((a, b) => b - a);

  const season =
    requestedSeason && seasons.includes(requestedSeason)
      ? requestedSeason
      : (currentSeasons[0] ??
        seasonRows[0]?.season ??
        new Date().getFullYear());

  const userIds = roster.map((row) => row.userId);

  if (userIds.length === 0) {
    return {
      season,
      seasons,
      summary: {
        total: 0,
        renewed: 0,
        pendingPayment: 0,
        pendingConfirmation: 0,
        notRenewed: 0,
      },
      members: [],
    };
  }

  const [users, seasonMemberships] = await Promise.all([
    db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        surname: true,
        email: true,
        role: true,
        image: true,
      },
      where: {
        id: { in: userIds },
      },
    }),
    db.query.clubMemberships.findMany({
      columns: {
        userId: true,
        confirmed: true,
        registrationType: true,
      },
      with: {
        payment: {
          columns: {
            status: true,
          },
        },
      },
      where: {
        clubId,
        season,
      },
    }),
  ]);

  const membershipsByUserId = new Map(
    seasonMemberships.map((membership) => [membership.userId, membership]),
  );

  const members = users
    .map((member) => {
      const membership = membershipsByUserId.get(member.id);
      const paymentStatus = membership?.payment?.status ?? null;

      let status: MembershipRenewalStatus;

      if (!membership) {
        status = "not_renewed";
      } else if (paymentStatus && UNPAID_STATUSES.includes(paymentStatus)) {
        status = "pending_payment";
      } else if (!membership.confirmed) {
        status = "pending_confirmation";
      } else {
        status = "renewed";
      }

      return {
        user: member,
        status,
        registrationType: membership?.registrationType ?? null,
        confirmed: membership?.confirmed ?? null,
        paymentStatus,
      };
    })
    .sort((a, b) => {
      const aName = `${a.user.surname} ${a.user.name}`.toLowerCase();
      const bName = `${b.user.surname} ${b.user.name}`.toLowerCase();
      return aName.localeCompare(bName, "sk");
    });

  const summary = {
    total: members.length,
    renewed: members.filter((member) => member.status === "renewed").length,
    pendingPayment: members.filter(
      (member) => member.status === "pending_payment",
    ).length,
    pendingConfirmation: members.filter(
      (member) => member.status === "pending_confirmation",
    ).length,
    notRenewed: members.filter((member) => member.status === "not_renewed")
      .length,
  };

  return { season, seasons, summary, members };
});
