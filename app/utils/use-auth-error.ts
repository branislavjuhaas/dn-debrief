import type { BASE_ERROR_CODES } from "better-auth";

const MESSAGES: Record<keyof typeof BASE_ERROR_CODES, string> = {
  USER_NOT_FOUND: "Používateľ nebol nájdený.",
  FAILED_TO_CREATE_USER: "Nepodarilo sa vytvoriť používateľa.",
  FAILED_TO_CREATE_SESSION: "Nepodarilo sa vytvoriť reláciu.",
  FAILED_TO_UPDATE_USER: "Nepodarilo sa aktualizovať používateľa.",
  FAILED_TO_GET_SESSION: "Nepodarilo sa získať reláciu.",
  INVALID_PASSWORD: "Neplatné heslo.",
  INVALID_EMAIL: "Neplatný e-mail.",
  INVALID_EMAIL_OR_PASSWORD: "Neplatný e-mail alebo heslo.",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "Sociálny účet je už prepojený.",
  PROVIDER_NOT_FOUND: "Poskytovateľ nebol nájdený.",
  INVALID_TOKEN: "Neplatný token.",
  ID_TOKEN_NOT_SUPPORTED: "ID token nie je podporovaný.",
  FAILED_TO_GET_USER_INFO: "Nepodarilo sa získať informácie o používateľovi.",
  USER_EMAIL_NOT_FOUND: "E-mail používateľa nebol nájdený.",
  EMAIL_NOT_VERIFIED: "E-mail nebol overený.",
  PASSWORD_TOO_SHORT: "Heslo je príliš krátke.",
  PASSWORD_TOO_LONG: "Heslo je príliš dlhé.",
  USER_ALREADY_EXISTS: "Používateľ už existuje.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "Používateľ už existuje. Použite iný e-mail.",
  EMAIL_CAN_NOT_BE_UPDATED: "E-mail sa nedá aktualizovať.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Účet s týmito povereniami nebol nájdený.",
  SESSION_EXPIRED:
    "Platnosť relácie vypršala. Opätovne sa prihláste, aby ste vykonali túto akciu.",
  FAILED_TO_UNLINK_LAST_ACCOUNT: "Nemôžete odpojiť svoj posledný účet.",
  ACCOUNT_NOT_FOUND: "Účet nebol nájdený.",
  USER_ALREADY_HAS_PASSWORD:
    "Používateľ už má heslo. Zadajte ho pre vymazanie účtu.",
};

export default (code: string | undefined): string =>
  MESSAGES[code as keyof typeof BASE_ERROR_CODES] ?? "Nastala neznáma chyba.";
