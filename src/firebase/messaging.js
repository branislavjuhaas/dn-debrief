// Define the messages
const messages = {
  welcome: {
    id: "welcome",
    title: "Introducing the DebRIEF system",
    message:
      "Welcome to the DebRIEF system developed by our developers for convenient data management in SDA.",
    link: null,
    local: true,
  },
  auth: {
    id: "auth",
    title: "Log into the system",
    message: "Please log in to the system to access all features.",
    link: "/auth",
    local: true,
  },
  join: {
    id: "join",
    title: "Don't forget to register",
    message: "If you want to participate in our events, register with SDA.",
    link: "/join",
    local: true,
  },
  pending: {
    id: "pending",
    title: "Waiting for confirmation",
    message:
      "Registration has not been confirmed. A confirmation link has been sent to your email.",
    link: null,
    local: false,
  },
  createClubs: {
    id: "createClubs",
    title: "Register all clubs",
    message:
      "Don't forget to register all clubs so their members can register.",
    link: "/manage/clubs",
    local: true,
  },
  manageClub: {
    id: "manageClub",
    title: "Manage your club",
    message: "Check out new members of your club and watch your club grow.",
    link: "/manage/clubs/{{Id}}",
    local: true,
  },
  learnMore: {
    id: "learnMore",
    title: "Want to know more about SDA?",
    message:
      "Click for more information about the Slovak Debate Association and its mission.",
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
