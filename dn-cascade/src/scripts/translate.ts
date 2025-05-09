import type { Role } from "../types/user.ts";

/**
 * Translates the given error code into a human-readable message.
 * @param error - The error code to translate.
 * @returns The translated error message.
 */
export const translateError = (error: string) => {
  switch (error) {
    case "auth/invalid-email":
      return "Neplatný email";
    case "auth/invalid-credential":
      return "Neplatné prihlasovacie údaje";
    case "auth/user-not-found":
      return "Neplatné prihlasovacie údaje";
    case "auth/weak-password":
      return "Heslo je príliš slabé";
    case "auth/email-already-in-use":
      return "Email už existuje";
    case "auth/invalid-action-code":
      return "Neplatný kód";
    default:
      return "Vyskytla sa chyba";
  }
};

/**
 * Translates the given role into a human-readable role name.
 * @param role - The role to translate.
 * @returns The translated role name.
 */
export const translateRole = (role: Role) => {
  switch (role) {
    case "developer":
      return "Vývojár";
    case "admin":
      return "Administrátor/-ka";
    case "cap":
      return "Hlavný/-á rozhodca/-kyňa";
    case "coach":
      return "Vedúci/-a klubu";
    case "user":
      return "Používateľ/-ka";
    case "organizer":
      return "Organizátor/-ka";
    case "junior":
      return "Junior organizátor/-ka";
    case "motion":
      return "Tézový výbor";
    default:
      return role;
  }
};

/**
 * Translates the given human-readable role name back into a role.
 * @param role - The translated role name to reverse translate.
 * @returns The reverse translated role.
 */
export const reverseTranslateRole = (role: string) => {
  switch (role) {
    case "Vývojár":
      return "developer";
    case "Administrátor/-ka":
      return "admin";
    case "Hlavný/-á rozhodca/-kyňa":
      return "cap";
    case "Vedúci/-a klubu":
      return "coach";
    case "Používateľ/-ka":
      return "user";
    case "Organizátor/-ka":
      return "organizer";
    case "Junior organizátor/-ka":
      return "junior";
    case "Tézový výbor":
      return "motion";
    default:
      return role;
  }
};

/**
 * Translates the given key into a human-readable key name.
 * @param key - The key to translate.
 * @returns The translated key name.
 */
export const translateKey = (key: string) => {
  switch (key) {
    case "uid":
      return "UID";
    case "provider":
      return "Poskytovateľ";
    case "name":
      return "Meno";
    case "surname":
      return "Priezvisko";
    case "email":
      return "Email";
    case "role":
      return "Funkcia";
    case "club":
      return "Debatný klub";
    case "address":
      return "Adresa";
    case "phone":
      return "Telefónne číslo";
    case "birthdate":
      return "Dátum narodenia";
    case "member":
      return "Registrovaný člen";
    case "supervisor":
      return "Zákonný zástupca";
    case "supervisorEmail":
      return "Email zákonného zástupcu";
    default:
      return key;
  }
};

/**
 * Translates the given award category into a human-readable category name.
 * @param category - The award category to translate.
 * @returns The translated award category name.
 */
export const translateAwardCategory = (category: string) => {
  switch (category) {
    case "system":
      return "Systémové ocenenie";
    case "organization":
      return "Ocenenie organizáciou";
    case "program":
      return "Programové ocenenie";
    case "unknown":
      return "Neznáme ocenenie";
    default:
      return category;
  }
};
