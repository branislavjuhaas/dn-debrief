<script setup lang="ts">
const authClient = useAuthClient();

const { data: sessionData } = await useAsyncData("session", () =>
  authClient.getSession({
    fetchOptions: {
      headers: useRequestHeaders(["cookie"]) as Record<string, string>,
    },
  }),
);

const stopImpersonatingUser = async () => {
  await authClient.admin.stopImpersonating();
  await navigateTo("/");
  await refreshNuxtData();
};
</script>

<template>
  <div>
    <UBanner
      v-if="sessionData?.data?.session.impersonatedBy"
      color="info"
      icon="i-ph-visor-bold">
      <template #title>
        <b>Ja je niekto iný&nbsp;&nbsp;|</b>
        &nbsp;&nbsp;Zosobňujete používateľa/-ku
        {{ sessionData?.data?.user?.name ?? "" }}
        {{ sessionData?.data?.user?.surname ?? "" }}.
        <UButton
          color="neutral"
          size="sm"
          class="ml-2"
          @click="stopImpersonatingUser">
          Ukončiť
        </UButton>
      </template>
    </UBanner>
  </div>
</template>
