import type { methodologyFiles } from "#server/db/schema/methodology";

export type MethodologyFile = SerializeInferredDates<
  typeof methodologyFiles.$inferSelect
> & {
  publicUrl?: string;
  author?: {
    id: number;
    name: string;
    surname: string;
    image: string | null;
  } | null;
};
