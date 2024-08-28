export const translateError = (error) => {
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

export const translateRole = (role) => {
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
    default:
      return role;
  }
};

export const reverseTranslateRole = (translatedRole) => {
  switch (translatedRole) {
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
    default:
      return translatedRole;
  }
};

export const translateKey = (key) => {
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
