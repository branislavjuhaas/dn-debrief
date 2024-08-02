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

export { translateError };
