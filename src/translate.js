const translateError = (error) => {
  switch (error) {
    case "auth/invalid-email":
      return "Neplatné prihlasovacie údaje";
    case "auth/invalid-credential":
      return "Neplatné prihlasovacie údaje";
    case "auth/user-not-found":
      return "Neplatné prihlasovacie údaje";
    case "auth/weak-password":
      return "Heslo je príliš slabé";
    default:
      return "Vyskytla sa chyba";
  }
};

export { translateError };
