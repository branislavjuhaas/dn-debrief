import type { payments, paymentStatusEnum } from "#server/db/schema/payments";

type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];

type Payment = typeof payments.$inferSelect;
