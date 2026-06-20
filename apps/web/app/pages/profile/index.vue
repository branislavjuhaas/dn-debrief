<script setup lang="ts">
import type { AlertProps, TabsItem, TimelineItem } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

const userStore = useUserStore();

useSeoMeta({
  title: userStore.fullName,
  description: "Profil aktuálne prihláseného/-ej používateľa/-ky",
});

const ULink = resolveComponent("ULink");

const authClient = useAuthClient();

const logout = async () => {
  authClient.signOut();
  userStore.$reset();
  navigateTo("/");
};

const tabItems = ref<TabsItem[]>([
  {
    label: "Osobné údaje",
    slot: "details",
  },
  {
    label: "Členstvá v SDA",
    slot: "memberships",
  },
  {
    label: "Registrácie a podujatia",
    disabled: true,
  },
  {
    label: "Platby",
    disabled: true,
  },
]);

const memberships = computed<TimelineItem[]>(() => {
  return (userStore.user?.clubMemberships ?? [])
    .sort((a, b) => (b.season ?? 0) - (a.season ?? 0))
    ?.map((m) => ({
      date: m.season.toString(),
      title: m.club?.name,
      icon: m.confirmed
        ? "i-ph-seal-check-bold"
        : new Date().getFullYear() > m.season
          ? "i-ph-seal-bold"
          : "i-ph-seal-question-bold",
      avatar: {
        class: m.confirmed
          ? "text-inverted! bg-success!"
          : new Date().getFullYear() > m.season
            ? "text-muted!"
            : "text-inverted! bg-warning!",
      },
    }));
});

const { data: seasonsData } = await useFetch("/api/settings/seasons", {
  key: "filtered-seasons",
});

const alert = computed<(AlertProps & { to?: string }) | null>(() => {
  if (!userStore.isComplete) {
    return {
      title: "Chýbajúce údaje",
      description:
        "Váš profil momentálne nie je kompletný. Prosím, doplňte chýbajúce údaje.",
      icon: "i-ph-detective",
      color: "warning",
      to: "/profile/edit",
    };
  }
  if (seasonsData.value?.seasons && seasonsData.value.seasons?.length > 0) {
    return {
      title: `Registrácia na ${(seasonsData.value.seasons?.length || 0) > 1 ? "roky" : "rok"} ${seasonsData.value.seasons?.join(", ")} otvorená`,
      description:
        "Nenechajte si ujsť žiadnu z výhod plného členstvo v SDA a zaregistrujte sa ešte dnes!",
      icon: "i-ph-megaphone",
      color: "primary",
      to: "/profile/join",
    };
  }
  return null;
});

const membershipsAlert = computed<AlertProps & { to?: string }>(() => {
  // check if there is a value with season equal to current year
  const currentMembership = userStore.user?.clubMemberships?.find(
    (m) => m.season === new Date().getFullYear(),
  );
  if (!currentMembership) {
    return {
      title: `Chýba registrácia na rok ${new Date().getFullYear()}`,
      icon: "i-ph-seal-warning",
      color: "error",
      to: "/profile/join",
    };
  }
  if (!currentMembership.confirmed) {
    return {
      title: `Registrácia na rok ${new Date().getFullYear()} nie je potvrdená`,
      icon: "i-ph-seal-warning",
      color: "warning",
    };
  }
  return {
    title: "Vaša registrácia do SDA je kompletná!",
    icon: "i-ph-seal-check",
    color: "success",
  };
});
</script>

<template>
  <UPage>
    <ProfileHeader :user="userStore.user!">
      <template #links>
        <UButton
          to="/profile/edit"
          icon="i-ph-magic-wand"
          color="neutral"
          variant="subtle">
          Upraviť profil
        </UButton>
        <UButton icon="i-ph-password" color="neutral" variant="subtle">
          Zmeniť heslo
        </UButton>
        <UButton icon="i-ph-plugs" color="error" @click="logout">
          Odhlásiť sa
        </UButton>
      </template>
    </ProfileHeader>
    <UPageBody>
      <UTabs
        :items="tabItems"
        variant="link"
        color="neutral"
        :ui="{
          content: 'mt-4 overflow-x-auto scrollbar-none',
        }">
        <template #details>
          <component
            :is="alert.to ? ULink : 'span'"
            v-if="alert"
            :to="alert.to">
            <UAlert variant="subtle" v-bind="alert" class="mb-4" />
          </component>
          <div
            class="flex flex-col lg:flex-row lg:justify-between gap-4 items-center sm:items-start">
            <ProfileDetails :user="userStore.user!" class="pl-6 w-full" />
            <ProfileAwards :user-awards="userStore.user!.awards" />
          </div>
        </template>
        <template #memberships>
          <component
            :is="membershipsAlert.to ? ULink : 'span'"
            :to="membershipsAlert.to">
            <UAlert
              v-bind="membershipsAlert"
              :ui="{ wrapper: 'flex-initial w-fit' }"
              class="mb-4 flex flex-row justify-center items-center font-medium" />
          </component>
          <UTimeline
            :items="memberships"
            orientation="horizontal"
            :ui="{
              item: 'flex-1 max-w-46 w-full',
            }" />
        </template>
      </UTabs>
    </UPageBody>
  </UPage>
</template>
