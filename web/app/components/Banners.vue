<script setup lang="ts">
import type { CampaignBanner } from "#shared/types/settings";

const authClient = useAuthClient();

const { data: sessionData } = await useAuthSession();

const { data: campaignBannerData } = await useFetch<{
  campaignBanner: CampaignBanner;
}>("/api/settings/campaign-banner", {
  key: "campaign-banner",
});

const campaignDismissed = useCookie<string | null>(
  "campaign-banner-dismissed",
  {
    default: () => null,
  },
);

const campaignBanner = computed(
  () => campaignBannerData.value?.campaignBanner ?? null,
);

const showCampaignBanner = computed(
  () =>
    Boolean(campaignBanner.value?.enabled) && campaignDismissed.value !== "1",
);

const dismissCampaign = () => {
  campaignDismissed.value = "1";
};

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
    <UBanner
      v-if="showCampaignBanner && campaignBanner"
      color="primary"
      icon="i-ph-megaphone-fill">
      <template #title>
        <span class="inline-flex flex-wrap items-center gap-x-3 gap-y-2">
          <b>{{ campaignBanner.title }}&nbsp;&nbsp;|</b>
          <span>{{ campaignBanner.text }}</span>
          <UButton
            :to="campaignBanner.url"
            target="_blank"
            rel="noopener noreferrer"
            color="neutral"
            size="sm"
            variant="solid"
            trailing-icon="i-ph-arrow-square-up-right">
            {{ campaignBanner.linkLabel }}
          </UButton>
        </span>
      </template>
      <template #close>
        <UButton
          icon="i-ph-x"
          color="neutral"
          variant="ghost"
          size="sm"
          aria-label="Skryť oznámenie"
          @click="dismissCampaign" />
      </template>
    </UBanner>
  </div>
</template>
