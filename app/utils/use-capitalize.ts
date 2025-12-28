/**
 * Capitalizes the first character of a string.
 *
 * If the string is empty this returns an empty string. Only the first character
 * is modified; the rest of the string is returned unchanged.
 *
 * @param str - The input string to capitalize.
 * @returns The input string with its first character converted to uppercase.
 */
export default (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
