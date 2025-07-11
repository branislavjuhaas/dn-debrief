<script setup lang="ts">
import { computed } from "vue";
import { useAlert } from "~/composables/useAlert";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
} from "reka-ui";

const { alert, hideAlert } = useAlert();

const isOpen = computed(() => !!alert.value);

const iconName = computed(() => {
  if (!alert.value) return "";
  if (alert.value.icon) return alert.value.icon;
  return alert.value.variant === "critical"
    ? "ph:warning-octagon-fill"
    : "ph:warning-fill";
});

function onOpenChange(open: boolean) {
  if (!open) {
    hideAlert();
  }
}
</script>

<template>
  <AlertDialogRoot v-if="alert" :open="isOpen" @update:open="onOpenChange">
    <AlertDialogPortal>
      <AlertDialogOverlay
        class="bg-black/30 backdrop-blur-[4px] data-[state=open]:animate-overlay-show fixed inset-0 z-30" />
      <AlertDialogContent
        class="z-[100] data-[state=open]:animate-content-show overflow-hidden fixed top-1/2 left-1/2 max-h-[85dvh] w-105 max-w-[calc(100dvw-2.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white text-black border-2 border-black shadow-dialog focus:outline-none">
        <AlertDialogTitle
          class="m-0 px-4 py-2 border-b-2 border-black text-base! font-bold flex items-center gap-2 justify-between"
          :class="
            alert.variant === 'critical' ? 'bg-red text-white' : 'bg-yellow'
          ">
          <div class="flex flex-row items-center gap-2">
            <Icon :name="iconName" />
            <span class="mt-1">{{ alert.title }}</span>
          </div>
          <AlertDialogCancel
            aria-label="Close"
            class="ease-in-out cursor-pointer">
            <Icon name="ph:x" />
          </AlertDialogCancel>
        </AlertDialogTitle>
        <div class="flex flex-col w-full p-4 gap-5">
          <AlertDialogDescription>
            {{ alert.content }}
          </AlertDialogDescription>
          <div class="flex flex-row w-full gap-4">
            <AlertDialogCancel as-child>
              <AppButton
                variant="secondary"
                size="dialog"
                class="w-full"
                @click="alert.onCancel">
                {{ alert.cancelText || "Zrušiť" }}
              </AppButton>
            </AlertDialogCancel>
            <AlertDialogAction as-child>
              <AppButton
                variant="primary"
                size="dialog"
                class="w-full"
                @click="alert.onContinue">
                {{ alert.continueText || "Pokračovať" }}
              </AppButton>
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
