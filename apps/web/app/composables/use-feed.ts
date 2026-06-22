import { version } from "~~/package.json";

type FeedItem = {
  title: string;
  content: string;
};

export default () =>
  computed(() => {
    const feed: Array<FeedItem> = [
      {
        title: `Predstavujeme DebRIEF v${version}`,
        content:
          "Vitajte na inteligentnej debatnej platforme. Všetky chyby a návrhy funkcií, prosíme, ohláste!",
      },
    ];

    const userStore = useUserStore();

    if (!userStore.isAuthenticated) {
      feed.push({
        title: "Prihláste sa do systému",
        content:
          "Pre prístup ku všetkým funkciám sa, prosím, prihláste do systému.",
      });
    }

    if (userStore.user?.role && userStore.user.role !== "user") {
      feed.push({
        title: "Prejsť na panel správy",
        content:
          "Pre úpravu nastavení a obsahu platformy, prejdite na panel správy.",
      });
    } else if (
      userStore.user?.managedClubs &&
      userStore.user.managedClubs.length > 0
    ) {
      feed.push({
        title: "Prejsť na panel správy",
        content:
          "Pre prehľad o vašom klube a jeho údajoch, prejdite na panel správy.",
      });
    }

    return feed;
  });
