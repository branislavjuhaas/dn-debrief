import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    about: defineCollection({
      type: "data",
      source: "about.yml",
      schema: z.object({
        hero: z.object({
          headline: z.string(),
          headlineIcon: z.string().editor({
            input: "icon",
            iconLibraries: ["ph", "lucide"],
          }),
          icons: z.array({
            icon: z.string().editor({
              input: "icon",
              iconLibraries: ["ph", "lucide"],
            }),
          }),
        }),
        platform: z.object({
          title: z.string(),
          description: z.string(),
          features: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
              icon: z.string().editor({
                input: "icon",
                iconLibraries: ["ph", "lucide"],
              }),
            }),
          ),
          image: z.string(),
          alt: z.string(),
        }),
      }),
    }),
  },
});
