<script setup lang="ts">
import { LazyProfileImageEditorDialog } from "#components";

const userStore = useUserStore();
const overlay = useOverlay();

const openProfileImageEditorDialog = () => {
  const modal = overlay.create(LazyProfileImageEditorDialog);

  modal.open();
};
</script>

<template>
  <span
    class="relative mx-auto inline-flex items-center justify-center shrink-0 select-none rounded-full align-middle bg-elevated size-40 text-4xl"
    aria-hidden="true">
    <NuxtImg
      v-if="userStore.user?.image"
      :src="userStore.user.image"
      alt=""
      width="160"
      height="160"
      class="h-full w-full rounded-[inherit] object-cover" />

    <span v-else class="font-medium truncate">
      {{ userStore.fullName }}
    </span>

    <UButton
      label="Zmeniť"
      size="xs"
      color="secondary"
      icon="i-ph-pencil-simple-line"
      class="absolute bottom-4 right-0 text-white font-medium ring-2 ring-bg overflow-hidden hover:bg-secondary-400 active:bg-secondary-400 dark:hover:bg-secondary-500 dark:active:bg-secondary-500"
      @click="openProfileImageEditorDialog" />
  </span>
</template>
