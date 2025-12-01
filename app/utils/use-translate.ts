const translations: Record<string, Record<string, string>> = {
  role: {
    user: "používateľ/-ka",
    organizer: "organizátor/-ka",
    junior_organizer: "junior organizátor/-ka",
    chief_adjudicator: "hlavný/-á rozhodca/-kyňa",
    motion_committee_member: "člen/-ka tézového výboru",
    admin: "administrátor/-ka",
    developer: "vývojár/-ka",
  },
};

/**
 * Retrieve a translation from the specified dictionary.
 *
 * @param dict - The top-level dictionary key (must be one of the keys in `translations`).
 * @param key - The specific translation key to look up within the dictionary.
 * @returns The translated string when available, otherwise returns the original `key`.
 */
export default (dict: keyof typeof translations, key: string): string => {
  return translations[dict]?.[key] ?? key;
};
