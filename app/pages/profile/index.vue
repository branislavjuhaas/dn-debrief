<script setup lang="ts">
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
    <UPageBody> </UPageBody>
  </UPage>
</template>
