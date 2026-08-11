import ExcelJS from "@zklogic/exceljs";
import { db } from "#server/db";
import { parseDate } from "@internationalized/date";

defineRouteMeta({
  openAPI: {
    tags: ["Users"],
    summary: "Export users to Excel",
    description: "Download an Excel export of registered users and clubs.",
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
  await requireUser(event, ["developer", "admin"]);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Používatelia-ky");

  const usersData = await db.query.users.findMany({
    with: {
      clubMemberships: {
        columns: {
          clubId: true,
          season: true,
        },
        with: {
          club: {
            columns: {
              name: true,
            },
          },
        },
      },
      legalGuardian: {
        columns: {
          name: true,
          email: true,
        },
      },
    },
  });

  const columns = [
    { name: "UID", filterButton: true },
    { name: "Meno", filterButton: true },
    { name: "Priezvisko", filterButton: true },
    { name: "Používateľská rola", filterButton: true },
    { name: "Debatný klub", filterButton: true },
    { name: "Email", filterButton: true },
    { name: "Telefónne číslo", filterButton: true },
    { name: "Dátum narodenia", filterButton: true },
    { name: "Ulica a číslo", filterButton: true },
    { name: "PSČ", filterButton: true },
    { name: "Obec", filterButton: true },
    { name: "Registrácie do SDA", filterButton: true },
    { name: "Platná registrácia do SDA", filterButton: true },
    {
      name: "Meno a priezvisko zákonného/-ej zástupcu/-kyne",
      filterButton: true,
    },
    { name: "Email zákonného/-ej zástupcu/-kyne", filterButton: true },
  ];

  const usersRows = usersData.map((user) => [
    user.id,
    user.name,
    user.surname,
    translateRole(user.role) || "Používateľ/-ka",
    user.clubMemberships?.find(
      (membership) => membership.season === new Date().getFullYear(),
    )?.club?.name,
    user.email,
    user.phone,
    user.birthDate
      ? parseDate(user.birthDate?.toString() ?? "").toDate("utc")
      : null,
    user.street,
    user.postalCode,
    user.town,
    user.clubMemberships
      ?.map((membership) => `${membership.club?.name} (${membership.season})`)
      .join(", ") || "Žiadne",
    {
      formula: `IF(ISNUMBER(SEARCH(TEXT(YEAR(TODAY()), "0"), INDIRECT("RC[-1]", 0))), "Áno", "Nie")`,
    },
    user.legalGuardian?.name || "",
    user.legalGuardian?.email || "",
  ]);

  worksheet.addTable({
    name: "Users",
    ref: "A1",
    headerRow: true,
    totalsRow: false,
    style: {
      theme: "TableStyleMedium9",
      showRowStripes: true,
    },
    columns: columns.map((col) => ({
      name: col.name,
      filterButton: col.filterButton,
    })),
    rows: usersRows,
  });

  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    if (column && column.eachCell) {
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
    }
    column.width = maxLength + 2;
  });

  const clubsSheet = workbook.addWorksheet("Debatné kluby");

  const clubColumns = [
    { header: "Názov", filterButton: true },
    { header: "Aktívny", filterButton: true },
    { header: "Debatná liga", filterButton: true },
    { header: "Región", filterButton: true },
    { header: "Počet členov/-iek", filterButton: true },
  ];

  const clubsData = await db.query.clubs.findMany({});

  const clubsRows = clubsData.map((club) => [
    club.name,
    club.isActive ? "Áno" : "Nie",
    translateLeague(club.league),
    translateRegion(club.region),
    {
      formula: `COUNTIFS(Users[Debatný klub], "${club.name}", Users[Platná registrácia do SDA], "Áno")`,
    },
  ]);

  clubsSheet.addTable({
    name: "Clubs",
    ref: "A1",
    headerRow: true,
    totalsRow: false,
    style: {
      theme: "TableStyleMedium9",
      showRowStripes: true,
    },
    columns: clubColumns.map((col) => ({
      name: col.header,
      filterButton: col.filterButton,
    })),
    rows: clubsRows,
  });

  clubsSheet.columns.forEach((column) => {
    let maxLength = 0;
    if (column && column.eachCell) {
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
    }
    column.width = maxLength + 2;
  });

  const buffer = await workbook.xlsx.writeBuffer();

  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename="Export_DN_DebRIEF_${new Date().toISOString().slice(0, 10)}.xlsx"`,
  );

  setHeader(
    event,
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  return buffer;
});
