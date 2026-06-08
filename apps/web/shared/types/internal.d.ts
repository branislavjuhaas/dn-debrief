export type SerializeInferredDates<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
      ? string | null
      : T[K] extends object
        ? SerializeDates<T[K]>
        : T[K];
};
