import type { UserRole } from "#shared/types/user";

export const translateAuthError = (errorCode: string) => {
  switch (errorCode) {
    // User related errors
    case "USER_NOT_FOUND":
      return "Používateľ nenájdený";
    case "FAILED_TO_CREATE_USER":
      return "Nepodarilo sa vytvoriť používateľa";
    case "FAILED_TO_UPDATE_USER":
      return "Nepodarilo sa aktualizovať používateľa";
    case "USER_ALREADY_EXISTS":
      return "Používateľ už existuje";
    case "USER_EMAIL_NOT_FOUND":
      return "Email používateľa sa nenašiel";
    case "USER_ALREADY_HAS_PASSWORD":
      return "Používateľ už má nastavené heslo";
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "Používateľ s týmto emailom už existuje. Použite, prosím, iný email";

    // Session related errors
    case "FAILED_TO_CREATE_SESSION":
      return "Nebolo možné vytvoriť používateľskú reláciu";
    case "FAILED_TO_GET_SESSION":
      return "Používateľská relácia nie je dostupná";
    case "SESSION_EXPIRED":
      return "Používateľská relácia vypršala. Prihláste sa, prosím, znova";

    // Authentication errors
    case "INVALID_PASSWORD":
      return "Nesprávne heslo";
    case "INVALID_EMAIL":
      return "Email v zlom formáte";
    case "INVALID_EMAIL_OR_PASSWORD":
      return "Nesprávny email alebo heslo";
    case "INVALID_TOKEN":
      return "Neplatný token";
    case "EMAIL_NOT_VERIFIED":
      return "Email nie je overený";
    case "CREDENTIAL_ACCOUNT_NOT_FOUND":
      return "Nemáte nastavené žiadne heslo";

    // Password related errors
    case "PASSWORD_TOO_SHORT":
      return "Príliš krátke heslo";
    case "PASSWORD_TOO_LONG":
      return "Príliš dlhé heslo";

    // Social auth errors
    case "SOCIAL_ACCOUNT_ALREADY_LINKED":
      return "Tento účet už je spárovaný";
    case "PROVIDER_NOT_FOUND":
      return "Nepodporovaný poskytovateľ identity";
    case "ID_TOKEN_NOT_SUPPORTED":
      return "Nepodporovaný id_token";
    case "FAILED_TO_GET_USER_INFO":
      return "Došlo k chybe pri čítaní informácií o používateľovi";

    // Account management errors
    case "EMAIL_CAN_NOT_BE_UPDATED":
      return "Email nie je možné zmeniť";
    case "FAILED_TO_UNLINK_LAST_ACCOUNT":
      return "Účet sa nepodarilo odpojiť";
    case "ACCOUNT_NOT_FOUND":
      return "Účet nenájdený";

    default:
      return "Nastala neznáma chyba. Skúste to, prosím, znova.";
  }
};

export const translateRole = (role?: UserRole) => {
  switch (role) {
    case "user":
      return "Používateľ/-ka";
    case "organizer":
      return "Organizátor/-ka";
    case "junior_organizer":
      return "Junior organizátor/-ka";
    case "chief_adjudicator":
      return "Hlavný/-á rozhodca/-kyňa";
    case "motion_committee_member":
      return "Člen/-ka tézového výboru";
    case "admin":
      return "Administrátor/-ka";
    case "developer":
      return "Vývojár/-ka";
    default:
      return "N/A";
  }
};

export const translateRegion = (region?: "western" | "central" | "eastern") => {
  switch (region) {
    case "western":
      return "Západoslovenský región";
    case "central":
      return "Stredoslovenský región";
    case "eastern":
      return "Východoslovenský región";
    default:
      return "Neznámy región";
  }
};

export const translateLeague = (
  league?: "junior" | "senior" | "university",
) => {
  switch (league) {
    case "junior":
      return "Základoškolský debatný program";
    case "senior":
      return "Stredoškolský debatný program";
    case "university":
      return "Vysokoškolský debatný program";
    default:
      return "Neznámy debatný program";
  }
};

export const translateRegistrationType = (
  registrationType?:
    | "junior_student"
    | "senior_student"
    | "graduate"
    | "teacher",
) => {
  switch (registrationType) {
    case "junior_student":
      return "Základoškolský/-á debatér/-ka";
    case "senior_student":
      return "Stredoškolský/-á debatér/-ka";
    case "graduate":
      return "Absolvent/-ka";
    case "teacher":
      return "Učiteľ/-ka";
    default:
      return "Neznámy typ registrácie";
  }
};

export const translatePaymentStatus = (
  status?:
    | "pending"
    | "processing"
    | "paid"
    | "forgiven"
    | "cancelled"
    | "failed",
) => {
  switch (status) {
    case "pending":
      return "Čakajúca";
    case "processing":
      return "Spracúvaná";
    case "paid":
      return "Zaplatená";
    case "forgiven":
      return "Odpustená";
    case "cancelled":
      return "Zrušená";
    case "failed":
      return "Zlyhala";
    default:
      return "Neznámy stav";
  }
};

export const translatePaymentType = (
  type: string | null | undefined,
): string => {
  switch (type) {
    case "event":
      return "Podujatie";
    case "membership":
      return "Členský poplatok";
    case "other":
      return "Iné";
    default:
      return type || "";
  }
};

export const translatePaymentResolution = (
  resolution: string | null | undefined,
): string => {
  switch (resolution) {
    case "stripe":
      return "Stripe (Automaticky)";
    case "manual":
      return "Manuálne";
    case "waived":
      return "Odpustené";
    default:
      return resolution || "";
  }
};
