<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

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
          <div class="flex flex-row justify-between ml-6">
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
