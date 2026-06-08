import type { payments, paymentStatusEnum } from "@dn-debrief/db/schema";

export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];

export type Payment = SerializeInferredDates<typeof payments.$inferSelect>;
