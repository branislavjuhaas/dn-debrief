import { db } from "#server/db";
import { requireUser } from "#server/utils/auth";
import { isPlatformRegistration } from "#shared/utils/events";
import type {
  RegistrationQuestion,
  RegistrationRole,
} from "#shared/types/event";
import ExcelJS from "@zklogic/exceljs";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "Export event registrations to Excel",
    description:
      "Download an Excel export of participants registered for this event.",
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "The slug of the event to export registrations from",
      },
    ],
    responses: {
      200: {
        description: "Excel workbook downloaded successfully",
        content: {
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
            schema: {
              type: "string",
              format: "binary",
            },
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      404: {
        description: "Event not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  await requireUser(event, [
    "developer",
    "admin",
    "chief_adjudicator",
    "organizer",
    "junior_organizer",
  ]);

  const slug = getRouterParam(event, "slug") ?? "";

  const eventRecord = await db.query.events.findFirst({
    where: { slug },
  });

  if (!eventRecord) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Event with slug "${slug}" not found`,
    });
  }

  const registrations = await db.query.eventRegistrations.findMany({
    where: {
      eventId: eventRecord.id,
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          surname: true,
          email: true,
          phone: true,
          birthDate: true,
        },
      },
      payment: {
        columns: {
          id: true,
          status: true,
          amount: true,
        },
      },
    },
    orderBy: (reg, { desc }) => [desc(reg.createdAt)],
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Registrácie");

  // Determine roles map and questions list from config if platform registration
  const rolesMap = new Map<string, RegistrationRole>();
  const questionsList: RegistrationQuestion[] = [];
  const questionTitlesSeen = new Map<string, number>();

  if (isPlatformRegistration(eventRecord.registrationConfig)) {
    for (const r of eventRecord.registrationConfig.roles) {
      rolesMap.set(r.uuid, r);
    }
    for (const section of eventRecord.registrationConfig.sections) {
      for (const q of section.questions) {
        if (!q.deleted) {
          questionsList.push(q);
        }
      }
    }
  }

  // Base columns
  const baseColumns = [
    { name: "ID", filterButton: true },
    { name: "Dátum registrácie", filterButton: true },
    { name: "Meno", filterButton: true },
    { name: "Priezvisko", filterButton: true },
    { name: "Email", filterButton: true },
    { name: "Telefónne číslo", filterButton: true },
    { name: "Typ účastníka", filterButton: true },
    { name: "Rola", filterButton: true },
    { name: "Tím", filterButton: true },
  ];

  // Dynamic question columns (ensure unique column headers for Excel)
  const questionColumns = questionsList.map((q) => {
    let colName = q.title.trim() || "Otázka";
    const count = questionTitlesSeen.get(colName) ?? 0;
    questionTitlesSeen.set(colName, count + 1);
    if (count > 0) {
      colName = `${colName} (${count + 1})`;
    }
    return { name: colName, filterButton: true, questionUuid: q.uuid };
  });

  const paymentColumns = [
    { name: "Poplatok (€)", filterButton: true },
    { name: "Stav platby", filterButton: true },
    { name: "ID platby", filterButton: true },
  ];

  const allColumns = [
    ...baseColumns,
    ...questionColumns.map((c) => ({
      name: c.name,
      filterButton: c.filterButton,
    })),
    ...paymentColumns,
  ];

  // Build rows
  const rows = registrations.map((reg) => {
    const role = reg.registrationData?.roleUuid
      ? rolesMap.get(reg.registrationData.roleUuid)
      : undefined;

    const name = reg.user?.name || reg.collectedDetails?.name || "";
    const surname = reg.user?.surname || reg.collectedDetails?.surname || "";
    const email = reg.user?.email || reg.collectedDetails?.email || "";
    const phone = reg.user?.phone || reg.collectedDetails?.phone || "";
    const participantType = reg.userId ? "Registrovaný používateľ" : "Hosť";
    const roleName = role?.name || "Neznáma rola";
    const teamName = reg.registrationData?.teamName || "";

    // Map answers by questionUuid
    const answerMap = new Map<string, unknown>();
    for (const item of reg.registrationData?.questions ?? []) {
      answerMap.set(item.questionUuid, item.answer);
    }

    const questionValues = questionColumns.map((col) => {
      const val = answerMap.get(col.questionUuid);
      if (val === null || val === undefined) return "";
      if (Array.isArray(val)) return val.join(", ");
      if (typeof val === "boolean") return val ? "Áno" : "Nie";
      if (typeof val === "string" || typeof val === "number") {
        return String(val);
      }
      if (typeof val === "object" && val !== null) {
        return JSON.stringify(val);
      }
      return "";
    });

    const fee = role ? role.cost : 0;
    let paymentStatus = "Bez poplatku";
    if (reg.payment) {
      if (reg.payment.status === "paid") {
        paymentStatus = "Zaplatené";
      } else if (
        reg.payment.status === "pending" ||
        reg.payment.status === "processing"
      ) {
        paymentStatus = "Čaká na úhradu";
      } else {
        paymentStatus = reg.payment.status;
      }
    } else if (fee > 0) {
      paymentStatus = "Nezaplatené";
    }

    const paymentId = reg.paymentId || "";

    const formattedDate = reg.createdAt
      ? new Date(reg.createdAt).toLocaleDateString("sk-SK", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return [
      reg.id,
      formattedDate,
      name,
      surname,
      email,
      phone,
      participantType,
      roleName,
      teamName,
      ...questionValues,
      fee,
      paymentStatus,
      paymentId,
    ];
  });

  worksheet.addTable({
    name: "Registrations",
    ref: "A1",
    headerRow: true,
    totalsRow: false,
    style: {
      theme: "TableStyleMedium9",
      showRowStripes: true,
    },
    columns: allColumns.map((col) => ({
      name: col.name,
      filterButton: col.filterButton,
    })),
    rows,
  });

  // Auto-fit column widths
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    if (column && column.eachCell) {
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value
          ? String(cell.value as unknown).length
          : 8;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
    }
    column.width = Math.min(Math.max(maxLength + 2, 10), 45);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  const safeSlug = eventRecord.slug
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .toUpperCase();
  const dateStr = new Date().toISOString().slice(0, 10);

  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename="Export_DN_DebRIEF_${safeSlug}_${dateStr}.xlsx"`,
  );
  setHeader(
    event,
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  return buffer;
});
