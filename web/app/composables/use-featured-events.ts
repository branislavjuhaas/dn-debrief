export type FeaturedEvent = {
  id: number;
  slug: string;
  name: string;
  beginning: Date;
  end: Date;
  thumbnailUrl: string | null;
  place: string | null;
};

export const useFeaturedEvents = () => {
  const { data } = useFetch("/api/events", {
    key: "upcoming-events",
  });

  return computed<FeaturedEvent[]>(() => {
    const events = data.value?.events ?? [];

    return events.map((event) => ({
      id: event.id,
      slug: event.slug,
      name: event.name,
      beginning: new Date(event.beginning),
      end: new Date(event.end),
      thumbnailUrl: event.thumbnailUrl,
      place: event.place,
    }));
  });
};
