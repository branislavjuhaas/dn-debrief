import type { Tables } from "./database.types";

export type User = Tables<"users"> & {
  details?: Tables<"details">;
  claims?: Tables<"claims">;
  memberships?: Tables<"memberships">[];
};
