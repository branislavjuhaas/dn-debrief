<script setup lang="ts">
import type { ButtonProps, PageFeatureProps } from "@nuxt/ui";
import { repository } from "~~/package.json";

definePageMeta({
  layout: "content",
});

// Hero

const heroLinks = ref<ButtonProps[]>([
  {
    label: "Vyskúšajte platformu",
    to: "/",
    color: "secondary",
    icon: "i-ph-airplane-takeoff",
  },
  {
    label: "Buďte jej budúcnosťou",
    to: repository.url,
    target: "_blank",
    color: "neutral",
    variant: "subtle",
    trailingIcon: "i-ph-github-logo",
  },
]);

// Features section

const features = ref<PageFeatureProps[]>([
  {
    title: "Intuitívna správa",
    description:
      "Prehľadné a prístupné rozhranie pre bezproblémovú organizáciu, správu dát a plynulú kontrolu nad celým ekosystémom.",
    icon: "i-ph-hand-tap-bold",
  },
  {
    title: "Prvotriedna integrácia",
    description:
      "Jednoduché prepojenie s existujúcimi systémami, nástrojmi a službami, ktoré umožňuje hladkú spoluprácu a efektívnu výmenu dát.",
    icon: "i-ph-hard-drives-bold",
  },
  {
    title: "Blesková rýchlosť",
    description:
      "Moderná architektúra navrhnutá pre okamžité odozvy, vysoký výkon a prácu bez zbytočného zdržania.",
    icon: "i-ph-gauge-bold",
  },
]);

const featureLinks = ref<ButtonProps[]>([
  {
    label: "API špecifikácia",
    to: "/api/docs",
    target: "_blank",
    external: true,
    color: "neutral",
    variant: "subtle",
    trailingIcon: "i-ph-book-open-text",
  },
  {
    label: "Prejsť na platformu",
    to: "/",
    trailingIcon: "i-ph-airplane-takeoff",
  },
]);

// Open source section

const oss = ref<PageFeatureProps[]>([
  {
    title: "Nuxt & Nuxt UI",
    description: "The Full-Stack Vue Framework",
    to: "https://nuxt.com",
    target: "_blank",
    icon: "i-simple-icons-nuxt",
  },
  {
    title: "Better Auth",
    description: "Najkomplexnejší autentifikačný framework",
    to: "https://better-auth.com/",
    target: "_blank",
    icon: "i-simple-icons-betterauth",
  },
  {
    title: "Drizzle",
    description: "Headless ORM pre TypeScript",
    to: "https://orm.drizzle.team/",
    target: "_blank",
    icon: "i-simple-icons-drizzle",
  },
  {
    title: "Vite+",
    description: "Zjednotený toolchain pre web",
    to: "https://viteplus.dev/",
    target: "_blank",
    icon: "i-simple-icons-vite",
  },
  {
    title: "Docker",
    description: "Akcelerovaný vývoj aplikácií v kontajneroch",
    to: "https://www.docker.com/",
    target: "_blank",
    icon: "i-simple-icons-docker",
  },
  {
    title: "VueUse",
    description: "Zbierka Vue Composition utilít",
    to: "https://vueuse.org/",
    target: "_blank",
    icon: "i-simple-icons-vueuse",
  },
]);

const ossLinks = ref<ButtonProps[]>([
  {
    label: "Zdrojový kód",
    to: repository.url,
    color: "neutral",
    variant: "subtle",
    trailingIcon: "i-ph-github-logo",
    target: "_blank",
  },
  {
    label: "Navrhnúť zlepšenie",
    to: `${repository.url}/issues/new`,
    trailingIcon: "i-ph-pipe-wrench",
    target: "_blank",
  },
]);

const dedications = [
  "Barbore Svitkovej",
  "Natálii Michalcovej",
  "Richardovi Tomkovi",
  "Jakubovi Koprdovi",
  "Vierke Kampošovej",
  "Janíkovi Kampošovi",
  "Marekovi Juhásovi",
  "Terézii Brišovej",
  "Tatiane Migovej",
  "Branislavovi Faktorovi",
  "Nine Melicherovej",
  "Branislavovi Erkenovi",
  "Jakubovi Bohušovi",
  "Eme M. Donátovej",
  "Richardovi Vaškovi",
  "Zuzane Brosinger",
  "Danielovi C. Roe",
  "odkazu Samuela Peterca",
];
</script>

<template>
  <UPage>
    <UPageHero
      headline="DebRIEF II"
      description="Moderná softvérová architektúra pre bezproblémovú správu a plynulý chod celej komunity. Rýchlejšia, prehľadnejšia a navrhnutá pre novú generáciu."
      :links="heroLinks"
      :ui="{
        root: 'relative',
        title: 'sm:text-5xl',
        headline: 'text-secondary font-bold',
      }">
      <template #top>
        <div
          class="absolute top-0 w-full h-150 bg-linear-to-b from-olive-300/25 dark:from-olive-700/25 to-transparent -z-50"></div>
      </template>
      <template #title>
        Inteligentná
        <span class="text-primary">debatná platforma</span>
      </template>
      <div
        class="flex flex-col sm:flex-row w-full items-center justify-center gap-10">
        <div class="flex flex-row sm:flex-col lg:flex-row gap-10">
          <UCard>
            <UIcon
              name="i-ph-users-three"
              class="size-16 line-clamp-none opacity-84" />
          </UCard>
          <UCard>
            <UIcon
              name="i-ph-ticket"
              class="size-16 line-clamp-none opacity-71" />
          </UCard>
        </div>

        <UCard class="ring-primary ring-1">
          <UIcon
            name="i-ph-brain"
            class="size-20 line-clamp-none text-primary" />
        </UCard>

        <div class="flex flex-row sm:flex-col lg:flex-row gap-10">
          <UCard>
            <UIcon
              name="i-ph-bank"
              class="size-16 line-clamp-none opacity-82" />
          </UCard>
          <UCard>
            <UIcon
              name="i-ph-newspaper-clipping"
              class="size-16 line-clamp-none opacity-76" />
          </UCard>
        </div>
      </div>
    </UPageHero>

    <UPageSection
      title="S vyšším štandardom organizačnej správy"
      description="DebRIEF II prináša ekosystém nástrojov, ktorý zjednodušuje komplexné procesy a posúva debatnú komunitu do modernej digitálnej éry."
      icon="i-ph-trend-up-bold"
      orientation="horizontal"
      :features="features"
      :links="featureLinks">
      <NuxtImg
        src="/assets/form.png"
        width="800"
        alt="Sunlake"
        class="w-full max-h-160 rounded-lg object-cover"
        loading="lazy" />
    </UPageSection>

    <USeparator />

    <UPageSection
      title="Z lásky ku komunite"
      description="Vytvorený s poďakovaním jadru spoločenstva SDA a jej dobrovoľíckym štruktúram. Venovaný:"
      icon="i-ph-hand-heart-fill"
      :ui="{ container: 'sm:gap-8' }">
      <div
        class="flex flex-row items-center justify-center flex-wrap gap-4 xl:px-10">
        <UBadge
          v-for="dedication in dedications"
          :key="dedication"
          color="neutral"
          variant="soft"
          size="xl">
          {{ dedication }}
        </UBadge>
      </div>
    </UPageSection>

    <USeparator />

    <UPageSection
      title="Srdcom open source"
      description="Konštruovaný výhradne na slobodnom softvéri so sľubom zostať sám otvoreným celému civilizovanému svetu. Dostupný online pre všetkých len vďaka nasledujúcim projektom:"
      icon="i-ph-git-merge-fill"
      :features="oss"
      :links="ossLinks">
    </UPageSection>
  </UPage>
</template>
