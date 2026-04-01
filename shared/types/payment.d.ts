import type { payments, paymentStatusEnum } from "#server/db/schema/payments";

export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];

export type Payment = typeof payments.$inferSelect;
