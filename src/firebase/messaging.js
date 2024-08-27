//#region Messages

const welcomeMessage = {
  id: "welcome",
  title: "Predstavujeme systém DebRIEF",
  message:
    "Vitaj v systéme DebRIEF vyvinutom našimi vývojármi pre pohodlnú správu dát v SDA.",
  link: null,
  local: true,
};

const authMessage = {
  id: "auth",
  title: "Prihlás sa do systému",
  message: "Pre prístup ku všetkým funkciám sa, prosím, prihlás do systému.",
  link: "/auth",
  local: true,
};

const joinMessage = {
  id: "join",
  title: "Nezabudni na registráciu",
  message: "Ak sa chceš zúčastniť našich podujatí, registruj sa do SDA.",
  link: "/join",
  local: true,
};

const pendingMessage = {
  id: "pending",
  title: "Čakáme na potvrdenie",
  message:
    "Registrácia nebola potvrdená. Link na potvrdenie ti bol zaslaný na email.",
  link: null,
  local: false,
};

const createClubsMessage = {
  id: "createClubs",
  title: "Registruj všetky kluby",
  message:
    "Nezabudni zaregistrovať všetky kluby, aby sa ich členovia mohli registrovať.",
  link: "/manage/clubs",
  local: true,
};

const manageClubMessage = {
  id: "manageClub",
  title: "Spravuj svoj klub",
  message: "Pozri si nových členov svojho klubu a sleduj ako tvoj klub rastie.",
  link: "/manage/clubs/{{Id}}",
  local: true,
};

const learnMoreMessage = {
  id: "learnMore",
  title: "Chceš vedieť viac o SDA?",
  message:
    "Klikni pre viac informácií o Slovenskej debatnej asociácii a jej misii.",
  link: "https://sda.sk",
  local: false,
};

//#endregion

export const feed = async (user) => {
  let messages = [];

  messages.push(welcomeMessage);

  if (!user || !user.uid) {
    messages.push(authMessage);
    return messages;
  }

  if (!user.isJoining) {
    messages.push(joinMessage);
    return messages;
  }

  if (user.isJoining && !user.isMember) {
    messages.push(pendingMessage);
  }

  if (user.role === "admin" || user.role === "developer") {
    messages.push(createClubsMessage);
  }

  if (user.role === "coach") {
    let clubMessage = { ...manageClubMessage };
    clubMessage.link = clubMessage.link.replace("{{Id}}", user.club.id);
    messages.push(clubMessage);
  }

  if (messages.length <= 2) {
    messages.push(learnMoreMessage);
  }

  return messages;
};
