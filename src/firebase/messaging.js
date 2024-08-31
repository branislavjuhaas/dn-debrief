// Definujte správy
const messages = {
  welcome: {
    id: "welcome",
    title: "Predstavujeme systém DebRIEF",
    message:
      "Vitaj v novom systéme DebRIEF, všetky chyby a návrhy funkcií ohlás, prosím, na juhas@sda.sk.",
    link: "mailto:juhas@sda.sk?subject=[DebRIEF] Chyba alebo návrh funkcie",
    local: false,
  },
  auth: {
    id: "auth",
    title: "Prihláste sa do systému",
    message:
      "Pre prístup ku všetkým funkciám sa, prosím, prihláste do systému.",
    link: "/auth",
    local: true,
  },
  join: {
    id: "join",
    title: "Nezabudnite sa zaregistrovať",
    message:
      "Ak sa chceš zúčastniť našich podujatí, staň sa členom alebo členkou SDA.",
    link: "/join",
    local: true,
  },
  pending: {
    id: "pending",
    title: "Čaká sa na potvrdenie",
    message:
      "Registrácia nebola potvrdená. Na tvoj e-mail bol odoslaný odkaz na potvrdenie.",
    link: null,
    local: false,
  },
  createClubs: {
    id: "createClubs",
    title: "Pridaj všetky kluby",
    message:
      "Nezabudni pridať všetky kluby, aby sa mohli zaregistrovať ich členovia.",
    link: "/manage/clubs",
    local: true,
  },
  manageClub: {
    id: "manageClub",
    title: "Spravuj svoj klub",
    message: "Pozri sa na nových členov tvojho klubu a sleduj, ako rastie.",
    link: "/manage/clubs/{{Id}}",
    local: true,
  },
  learnMore: {
    id: "learnMore",
    title: "Chceš vedieť viac o SDA?",
    message:
      "Klikni pre viac informácií o Slovenskej debatej asociácii a jej poslaní.",
    link: "https://sda.sk",
    local: false,
  },
};

/**
 * Generate a list of messages for the user.
 * @param {Object} user - The user object.
 * @returns {Array} - The list of messages.
 */
export const feed = async (user) => {
  let feedMessages = [];

  feedMessages.push(messages.welcome);

  if (!user || !user.uid) {
    feedMessages.push(messages.auth);
    return feedMessages;
  }

  if (!user.isJoining) {
    feedMessages.push(messages.join);
    return feedMessages;
  }

  if (user.isJoining && !user.isMember) {
    feedMessages.push(messages.pending);
  }

  if (user.role === "admin" || user.role === "developer") {
    feedMessages.push(messages.createClubs);
  }

  if (user.role === "coach") {
    let clubMessage = { ...messages.manageClub };
    clubMessage.link = clubMessage.link.replace("{{Id}}", user.club.id);
    feedMessages.push(clubMessage);
  }

  if (feedMessages.length <= 2) {
    feedMessages.push(messages.learnMore);
  }

  return feedMessages;
};
