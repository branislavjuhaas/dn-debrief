<script setup lang="ts">
import type { AlertProps, TabsItem } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

const ULink = resolveComponent("ULink");

const userStore = useUserStore();
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

const alert = ref<(AlertProps & { to?: string }) | null>(null);

if (!userStore.isComplete) {
  alert.value = {
    title: "Chýbajúce údaje",
    description:
      "Váš profil momentálne nie je kompletný. Prosím, doplňte chýbajúce údaje.",
    icon: "i-ph-detective",
    color: "warning",
    to: "/profile/edit",
  };
} else {
  const { data } = await useFetch("/api/settings/seasons", { key: "seasons" });

  const userSeasons = userStore.user?.clubMemberships?.map(
    (membership) => membership.season,
  );

  const filteredSeasons = data.value?.seasons?.filter(
    (season) => !userSeasons?.includes(season),
  );

  if (filteredSeasons && filteredSeasons.length > 0) {
    alert.value = {
      title: `Registrácia na ${(filteredSeasons?.length || 0) > 1 ? "roky" : "rok"} ${filteredSeasons?.join(", ")} otvorená`,
      description:
        "Nenechajte si ani v nich ujsť žiadnu z výhod plného členstvo v SDA a zaregistrujte sa ešte dnes!",
      icon: "i-ph-megaphone",
      color: "primary",
      to: "/profile/join",
    };
  }
}
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
      <UTabs :items="tabItems" variant="link" :ui="{ content: 'mt-4' }">
        <template #details>
          <component
            :is="alert.to ? ULink : 'span'"
            v-if="alert"
            :to="alert.to">
            <UAlert variant="subtle" v-bind="alert" class="mb-4" />
          </component>
          <div class="flex flex-col lg:flex-row lg:justify-between ml-6 gap-4">
            <ProfileDetails :user="userStore.user!" />
            <ProfileAwards :user-awards="userStore.user!.awards" />
          </div>
        </template>
        <template #memberships>
          <div>Členstvá v SDA</div>
        </template>
      </UTabs>
    </UPageBody>
  </UPage>
</template>
