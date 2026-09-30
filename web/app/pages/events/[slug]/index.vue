<script setup lang="ts">
import type { Event } from "#shared/types/event";
import type { UserRole } from "#shared/types/user";
import security from "@comark/nuxt/plugins/security";
import type { ButtonProps } from "@nuxt/ui";
import {
  isExternalRegistration,
  isPlatformRegistration,
} from "#shared/utils/events";

const route = useRoute();
const slug = route.params.slug as string;

// Event details data fetching
const { data: eventData } = await useFetch<{ event: Event }>(
  `/api/events/${slug}`,
  {
    key: `events-${slug}`,
  },
);

if (!eventData.value?.event) {
  throw createError({
    statusCode: 404,
    statusMessage: "Podujatie nenájdené",
    message: `Podujatie s ID: "${slug}" nebolo nájdené`,
  });
}

const event = computed(() => eventData.value?.event);

const { data: userData } = await useFetch(`/api/users/me`, {
  key: `users-me`,
});

const headerLinks = computed<ButtonProps[]>(() => [
  {
    label: "Upraviť podujatie",
    to: `/manage/events/${slug}/edit`,
    color: "primary",
    variant: "subtle",
    icon: "i-ph-pencil-simple",
  },
]);

const plugins = [
  security({
    blockedTags: ["script", "iframe"],
    allowedProtocols: ["https", "mailto"],
  }),
];

const isExternal = computed(() =>
  isExternalRegistration(event.value?.registrationConfig),
);

const registrationTarget = computed(() => {
  const config = event.value?.registrationConfig;
  if (!config) return undefined;
  if (isExternalRegistration(config)) {
    return config.href;
  }
  return `/events/${slug}/register`;
});

const registrationError = computed<string | null>(() => {
  const config = event.value?.registrationConfig;
  if (!config) {
    return "Chýba konfigurácia podujatia a nemožno sa naň preto zaregistrovať.";
  }

  // 1. Check deadline
  if (isExternalRegistration(config) && config.deadline) {
    const deadlineTime = new Date(config.deadline).getTime();
    if (Number.isNaN(deadlineTime) || Date.now() > deadlineTime) {
      return "Registrácia na podujatie je už po stanovenom deadline.";
    }
  } else if (isPlatformRegistration(config) && config.softDeadline) {
    const deadlineTime = new Date(config.softDeadline).getTime();
    if (Number.isNaN(deadlineTime) || Date.now() > deadlineTime) {
      return "Registrácia na podujatie je už po stanovenom termíne.";
    }
  }

  // 2. Check active membership for current season
  if (config.requireMembership) {
    const currentYear = new Date().getFullYear();
    const hasActiveMembership = userData.value?.user?.clubMemberships?.some(
      (m: any) => Number(m.season) === currentYear && m.confirmed === true,
    );

    if (!hasActiveMembership) {
      return "Na registráciu je potrebné potvrdené členstvo v SDA pre aktuálnu sezónu.";
    }
  }

  return null;
});
</script>

<template>
  <UPage>
    <UPageHeader
      :title="event!.name"
      :links="
        [
          'developer',
          'admin',
          'chief_adjudicator',
          'organizer',
          'junior_organizer',
        ].includes(userData?.user?.role ?? 'user')
          ? headerLinks
          : []
      " />
    <UPageBody>
      <EventQuickCard :event="event!" />
      <Markdown :value="event!.description" :plugins="plugins" />
      <USeparator />
      <ProseH2>Harmonogram podujatia</ProseH2>
      <EventSchedule :schedule="event!.schedule" />
      <USeparator />
      <ProseH2>Organizátori/-ky podujatia</ProseH2>
      <div class="flex flex-row gap-8 flex-wrap">
        <UUser
          v-for="organizer in event!.organizers as Array<{
            id: number;
            name: string;
            surname: string;
            role: UserRole;
            email: string;
            phone: string;
            image: string | null;
          }>"
          :key="organizer.id"
          :name="`${organizer.name} ${organizer.surname}`"
          :description="
            organizer.phone?.replace(
              /^(\+421)(\d{3})(\d{3})(\d{3})$/,
              '$1 $2 $3 $4',
            ) ?? undefined
          "
          :to="`/users/${organizer.id}`"
          :avatar="{
            src: organizer.image ?? undefined,
            alt: `${organizer.name} ${organizer.surname}`,
            loading: 'lazy',
          }" />
      </div>
      <template v-if="registrationError">
        <USeparator />
        <UAlert
          color="error"
          title="Registrácia na podujatie nie je možná"
          :description="registrationError"
          icon="i-ph-warning" />
      </template>
      <div class="flex flex-row justify-end gap-4">
        <UModal title="Pravidlá registrácie a účasti na podujatiach">
          <UButton
            label="Pravidlá registrácie"
            variant="subtle"
            color="neutral"
            icon="i-ph-book-bookmark" />

          <template #body>
            <ProseOl>
              <ProseLi>
                Bez registrácie, ktorá pre osoby do 18 rokov obsahuje aj súhlasy
                rodičov, z právneho hľadiska nemôžeme umožniť účasť na našom
                podujatí.
              </ProseLi>
              <ProseLi>
                Poplatok treba uhradiť najneskôr v deň zahájenia podujatia. Tím,
                ktorý neuhradil účastnícke poplatky za jeden turnaj, sa nebude
                môcť zúčastniť ďalšieho turnaja SDL, kým dlh nevyrovná. Nárok na
                vrátenie účastníckeho poplatku má tím iba v prípade, že sa
                odhlási viac ako 5 dní pred konaním turnaja.
              </ProseLi>
              <ProseLi>
                Výnimku majú kluby, ktorým hradí časť účastníckych poplatkov
                škola – nemusia uhradiť poplatky pred konaním turnaja, ale musia
                zaslať informácie k vystaveniu faktúry pred jeho konaním.
              </ProseLi>
            </ProseOl>
          </template>
        </UModal>
        <UButton
          :to="registrationTarget"
          :target="isExternal ? '_blank' : undefined"
          :disabled="!!registrationError || !registrationTarget"
          label="Registrovať sa na podujatie"
          icon="i-ph-ticket" />
      </div>
    </UPageBody>
  </UPage>
</template>
