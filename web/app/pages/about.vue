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
      description="Vytvorený s poďakovaním jadru spoločenstva SDA a jej dobrovoľníckym štruktúram. Venovaný:"
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

    <USeparator />

    <div
      class="text-base sm:text-lg text-muted text-center items-center flex flex-col py-16 gap-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 36 36"
        fill="none">
        <path
          d="M4.98358 36C2.66232 35.1927 1.43861 32.6684 2.25125 30.3624L11.0927 5.26479C12.7668 0.512655 18.5977 -1.63834 23.1236 1.42373C23.6676 1.79166 24.1601 2.23507 24.5793 2.73912C26.4474 4.97637 26.948 7.8484 26.0282 10.4576L25.1708 12.8916C26.8327 12.6976 28.5435 13.0386 30.0928 13.9186C30.9583 14.4106 31.7221 15.075 32.3272 15.8621C34.0095 18.0562 34.4328 20.7988 33.5523 23.3002L31.9772 27.772C29.6559 26.9647 28.4322 24.4404 29.2449 22.1344L29.3222 21.9148C29.5406 21.2948 29.618 20.6223 29.4701 19.9821C29.1472 18.5805 28.0673 17.5629 26.6631 17.3149C24.9822 17.0184 23.3488 18.0656 22.7858 19.6667L19.9313 27.772C17.6101 26.9647 16.3864 24.4404 17.199 22.1344L21.8266 8.99668C22.4561 7.20823 21.5051 5.24457 19.7048 4.61922C17.9031 3.99252 15.9278 4.93863 15.2983 6.72708L4.98358 36Z"
          fill="var(--ui-primary)" />
      </svg>
      <span
        >Platforma DebRIEF je hrdou súčasťou <b>Softvérovej rodiny DN</b></span
      >
    </div>
  </UPage>
</template>
