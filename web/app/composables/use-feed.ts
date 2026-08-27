import { version } from "~~/package.json";

export type FeedItem = {
  title: string;
  content: string;
  to?: string;
};

export const useFeed = () => {
  const { data } = useFetch("/api/users/me", {
    key: "users-me",
  });

  return computed<FeedItem[]>(() => {
    const feed: FeedItem[] = [
      {
        title: `Predstavujeme DebRIEF v${version}`,
        content:
          "Vitajte na inteligentnej debatnej platforme. Všetky chyby a návrhy funkcií, prosíme, ohláste!",
        to: "/about",
      },
    ];

    const user = data.value?.user;

    if (!user) {
      feed.push({
        title: "Prihláste sa do systému",
        content:
          "Pre prístup ku všetkým funkciám sa, prosím, prihláste do systému.",
        to: "/auth",
      });
      return feed;
    }

    if (user.role && user.role !== "user") {
      feed.push({
        title: "Prejsť na panel správy",
        content:
          "Pre úpravu nastavení a obsahu platformy, prejdite na panel správy.",
        to: "/manage",
      });
    } else if (user.managedClubs?.length) {
      feed.push({
        title: "Prejsť na panel správy",
        content:
          "Pre prehľad o vašom klube a jeho údajoch, prejdite na panel správy.",
        to: "/manage",
      });
    }

    return feed;
  });
};
