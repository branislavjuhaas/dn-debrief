/**
 * Calculates the age in full years between a birthdate and a reference date.
 *
 * @param birthdate - Birth date as a `Date` instance or ISO-like string.
 * @param today - Reference date (defaults to current date) as a `Date` instance or ISO-like string.
 * @returns The non-negative integer age, or `NaN` if either date is invalid.
 */
export default (
  birthdate: string | Date,
  today: string | Date = new Date(),
): number => {
  const birth = new Date(birthdate);
  const now = new Date(today);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(now.getTime())) {
    return Number.NaN;
  }

  const age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());

  return beforeBirthday ? Math.max(age - 1, 0) : Math.max(age, 0);
};
