<script setup lang="ts">
import type { AlertProps, TabsItem, TimelineItem } from "@nuxt/ui";

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
  const { data } = await useFetch("/api/settings/seasons", {
    key: "filtered-seasons",
  });

  if (data.value?.seasons && data.value.seasons?.length > 0) {
    alert.value = {
      title: `Registrácia na ${(data.value.seasons?.length || 0) > 1 ? "roky" : "rok"} ${data.value.seasons?.join(", ")} otvorená`,
      description:
        "Nenechajte si ujsť žiadnu z výhod plného členstvo v SDA a zaregistrujte sa ešte dnes!",
      icon: "i-ph-megaphone",
      color: "primary",
      to: "/profile/join",
    };
  }
}

const memberships = computed<TimelineItem[]>(() => {
  return (
    userStore.user?.clubMemberships?.map((m) => ({
      date: m.season.toString(),
      title: m.club?.name,
      icon: m.confirmed ? "i-ph-seal-check-bold" : "i-ph-seal-question-bold",
    })) ?? []
  );
});

const currentMembership = computed(() => {
  return userStore.user?.clubMemberships?.filter(
    (m) => m.season === new Date().getFullYear(),
  )[0];
});

const membershipValue = computed(() => {
  return currentMembership.value
    ? currentMembership.value.confirmed
      ? memberships.value.length - 1
      : memberships.value.length - 2
    : memberships.value.length - 1;
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
        :ui="{ content: 'mt-4' }">
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
          <UTimeline
            v-model="membershipValue"
            :items="memberships"
            orientation="horizontal"
            :color="
              currentMembership
                ? currentMembership.confirmed
                  ? 'primary'
                  : 'warning'
                : 'error'
            "
            :ui="{
              root: 'w-fit',
              item: 'flex-1',
            }" />
        </template>
      </UTabs>
    </UPageBody>
  </UPage>
</template>
