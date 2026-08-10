export type SystemAward = {
  name: string;
  category: "program" | "institutional" | "system" | "unknown";
  special: boolean;
  icon: string;
  levels: {
    level: number;
    title: string;
    description: string;
  }[];
};

export const awards: Record<string, SystemAward> = {
  developer: {
    name: "Vývojár/-ka",
    category: "system",
    special: false,
    icon: "i-ph-code",
    levels: [
      {
        level: 1,
        title: "Priateľ/-ka vývoja",
        description: "Osoba s príspevkom k vývoju platformy DebRIEF",
      },
      {
        level: 2,
        title: "Vývojár/-ka",
        description: "Vývojár/-ka s príspevkom k vývoju platformy DebRIEF",
      },
      {
        level: 3,
        title: "Kľúčový/-á vývojár/-ka",
        description:
          "Vývojár/-ka so zásadným príspevkom k vývoju platformy DebRIEF",
      },
      {
        level: 4,
        title: "Vlastník/-čka platformy",
        description:
          "Vývojár/-ka od ktorého/-ej závisí existencia platformy DebRIEF",
      },
    ],
  },
  volunteer: {
    name: "Dobrovoľník/-čka",
    category: "institutional",
    special: false,
    icon: "i-ph-heartbeat",
    levels: [
      {
        level: 1,
        title: "Bronzový/-á dobrovoľník/-čka",
        description:
          "Začínajúci/-a dobrovoľník/-čka v Slovenskej debatnej asociácii",
      },
      {
        level: 2,
        title: "Strieborný/-á dobrovoľník/-čka",
        description: "Dobrovoľník/-čka v Slovenskej debatnej asociácii",
      },
      {
        level: 3,
        title: "Zlatý/-á dobrovoľník/-čka",
        description:
          "Zaslúžilý/-á dobrovoľník/-čka v Slovenskej debatnej asociácii",
      },
      {
        level: 4,
        title: "Diamantový/-á dobrovoľník/-čka",
        description:
          "Dobrovoľník/-čka v Slovenskej debatnej asociácii s obrovskými zásluhami",
      },
    ],
  },
  canary: {
    name: "Kanárik",
    category: "system",
    special: false,
    icon: "i-ph-bird",
    levels: [
      {
        level: 1,
        title: "Kanárik poľný",
        description: "Osoba podieľajúca sa na testovaní platformy DebRIEF",
      },
      {
        level: 2,
        title: "Kanárik vrchovský",
        description:
          "Osoba aktívne podieľajúca sa na testovaní platformy DebRIEF",
      },
      {
        level: 3,
        title: "Kanárik sivokrký",
        description:
          "Osoba testovaním podieľajúca sa na smerovaní vývoja platformy DebRIEF",
      },
      {
        level: 4,
        title: "Kanárik žltohlavý",
        description:
          "Osoba podieľajúca sa na smerovaní vývoja platformy DebRIEF testovaním neoficiálnych verzií",
      },
    ],
  },
};

export const getAward = (awardName: string): SystemAward => {
  if (awards[awardName]) {
    return awards[awardName];
  }

  return {
    name: "Neznáme ocenenie",
    category: "unknown",
    special: false,
    icon: "i-ph-question-mark",
    levels: [],
  };
};
