/**
 * Formats a date range with minimal repetition.
 *
 * Rules:
 * \- same day: `D. M. YYYY`
 * \- same month and year: `D. \- D. M. YYYY`
 * \- same year, different month: `D. M. \- D. M. YYYY`
 * \- different years: `D. M. YYYY \- D. M. YYYY`
 */
export default (beginning: Date, end: Date): string => {
  const start = beginning <= end ? beginning : end;
  const finish = beginning <= end ? end : beginning;

  const sameYear = start.getFullYear() === finish.getFullYear();
  const sameMonth = sameYear && start.getMonth() === finish.getMonth();
  const sameDay = sameMonth && start.getDate() === finish.getDate();

  const day = (date: Date) => `${date.getDate()}.`;
  const month = (date: Date) => `${date.getMonth() + 1}.`;
  const year = (date: Date) => `${date.getFullYear()}`;

  if (sameDay) {
    return `${day(start)} ${month(start)} ${year(start)}`;
  }

  if (sameMonth) {
    return `${day(start)} - ${day(finish)} ${month(start)} ${year(start)}`;
  }

  if (sameYear) {
    return `${day(start)} ${month(start)} - ${day(finish)} ${month(finish)} ${year(start)}`;
  }

  return `${day(start)} ${month(start)} ${year(start)} - ${day(finish)} ${month(finish)} ${year(finish)}`;
};
