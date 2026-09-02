import ExcelJS from "@zklogic/exceljs";
import { db } from "#server/db";

defineRouteMeta({
  openAPI: {
    tags: ["Payments"],
    summary: "Export payments to Excel",
    description:
      "Download an Excel export of all payments and associated user details.",
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

  const paymentsSheet = workbook.addWorksheet("Platby");

  const paymentsData = await db.query.payments.findMany({
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          surname: true,
          email: true,
        },
      },
      resolvedByUser: {
        columns: {
          name: true,
          surname: true,
          email: true,
        },
      },
    },
    orderBy: (payments, { desc }) => [desc(payments.createdAt)],
  });

  const columns = [
    { name: "ID Platby", filterButton: true },
    { name: "Meno používateľa/-ky", filterButton: true },
    { name: "Priezvisko používateľa/-ky", filterButton: true },
    { name: "Email používateľa/-ky", filterButton: true },
    { name: "Typ platby", filterButton: true },
    { name: "Popis", filterButton: true },
    { name: "Suma (€)", filterButton: true },
    { name: "Stav platby", filterButton: true },
    { name: "Spôsob vyriešenia", filterButton: true },
    { name: "Dátum vytvorenia", filterButton: true },
    { name: "Dátum úhrady", filterButton: true },
    { name: "Vyriešil/-a", filterButton: true },
    { name: "Poznámka", filterButton: true },
    { name: "Stripe Session ID", filterButton: true },
    { name: "Stripe Payment Intent ID", filterButton: true },
  ];

  const paymentsRows = paymentsData.map((payment) => [
    payment.id,
    payment.user?.name || "",
    payment.user?.surname || "",
    payment.user?.email || "",
    translatePaymentType(payment.paymentType),
    payment.description,
    payment.amount / 100,
    translatePaymentStatus(payment.status),
    translatePaymentResolution(payment.resolution),
    payment.createdAt ? new Date(payment.createdAt) : null,
    payment.paidAt ? new Date(payment.paidAt) : null,
    payment.resolvedByUser
      ? `${payment.resolvedByUser.name} ${payment.resolvedByUser.surname}`.trim()
      : "",
    payment.note || "",
    payment.stripeCheckoutSessionId || "",
    payment.stripePaymentIntentId || "",
  ]);

  paymentsSheet.addTable({
    name: "PaymentsTable",
    ref: "A1",
    headerRow: true,
    totalsRow: true,
    style: {
      theme: "TableStyleMedium9",
      showRowStripes: true,
    },
    columns: columns.map((col) => ({
      name: col.name,
      filterButton: col.filterButton,
      // Total sum on the 'Suma (€)' column
      totalsRowFunction: col.name === "Suma (€)" ? "sum" : undefined,
    })),
    rows: paymentsRows,
  });

  paymentsSheet
    .getColumn(7)
    .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        // Skip header
        cell.numFmt = "#,##0.00 €";
      }
    });

  // Column 10 & 11: Dátumy
  [10, 11].forEach((colIndex) => {
    paymentsSheet
      .getColumn(colIndex)
      .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber > 1) {
          // Skip header
          cell.numFmt = "dd.mm.yyyy hh:mm";
        }
      });
  });
  // Auto-fit column widths
  paymentsSheet.columns.forEach((column) => {
    let maxLength = 0;
    if (column && column.eachCell) {
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value
          ? String(cell.value as unknown).length
          : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
    }
    column.width = Math.min(Math.max(maxLength + 3, 12), 40);
  });

  const summarySheet = workbook.addWorksheet("Súhrn platieb");

  const summaryColumns = [
    { name: "Stav platby", filterButton: true },
    { name: "Počet platieb", filterButton: true },
    { name: "Celková suma (€)", filterButton: true },
  ];

  const statuses: PaymentStatus[] = [
    "paid",
    "pending",
    "processing",
    "cancelled",
    "forgiven",
    "failed",
  ];

  const summaryRows = statuses.map((status) => {
    const translatedStatus = translatePaymentStatus(status);
    return [
      translatedStatus,
      {
        formula: `COUNTIF(PaymentsTable[Stav platby], "${translatedStatus}")`,
      },
      {
        formula: `SUMIF(PaymentsTable[Stav platby], "${translatedStatus}", PaymentsTable[Suma (€)])`,
      },
    ];
  });

  summarySheet.addTable({
    name: "PaymentsSummaryTable",
    ref: "A1",
    headerRow: true,
    totalsRow: true,
    style: {
      theme: "TableStyleMedium9",
      showRowStripes: true,
    },
    columns: summaryColumns.map((col) => ({
      name: col.name,
      filterButton: col.filterButton,
      totalsRowFunction:
        col.name === "Počet platieb"
          ? "sum"
          : col.name === "Celková suma (€)"
            ? "sum"
            : undefined,
    })),
    rows: summaryRows,
  });

  summarySheet
    .getColumn(3)
    .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.numFmt = "#,##0.00 €";
      }
    });

  summarySheet.columns.forEach((column) => {
    let maxLength = 0;
    if (column && column.eachCell) {
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value
          ? String(cell.value as unknown).length
          : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
    }
    column.width = maxLength + 4;
  });

  // Write and return buffer
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
