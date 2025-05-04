/**
 * Formats a Date object into a Slovak date string.
 *
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string in 'dd.mm.yyyy' format.
 */
export const formatSlovakDate = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * Formats a Date object into an ISO date string.
 *
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string in 'yyyy-mm-dd' format.
 */
export const formatISODate = (date) => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

/**
 * Despite liberals' objections, determines gender based on the provided name and surname.
 *
 * @param {string} name - The first name of the individual.
 * @param {string} surname - The surname of the individual.
 * @returns {boolean} - Returns true if the assumprion is that the individual is male,
 * and false if the assumption is that the individual
 */
export const assumeGender = (name, surname) => {
  const n = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const s = surname
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return n.endsWith("a") || s.endsWith("ova") ? false : true;
};
