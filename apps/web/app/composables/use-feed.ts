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

    return feed;
  });
