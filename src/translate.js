const translateError = (error) => {
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

const translateRole = (role) => {
  switch (role) {
    case "developer":
      return "Vývojár";
    case "admin":
      return "Administrátor";
    case "cap":
      return "Hlavný rozhodca";
    case "coach":
      return "Vedúci klubu";
    case "user":
      return "Používateľ";
    default:
      return role;
  }
};

const translateKey = (key) => {
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
    default:
      return key;
  }
};

export { translateError, translateRole, translateKey };
