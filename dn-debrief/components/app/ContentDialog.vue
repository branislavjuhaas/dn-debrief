<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "reka-ui";

const props = withDefaults(
  defineProps<{
    title: string;
    icon?: string;
    actionText?: string;
    cancelText?: string;
    disabled?: boolean;
  }>(),
  {
    icon: "ph:question-fill",
    actionText: "Potvrdiť",
    cancelText: "Zrušiť",
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: "action", payload: { preventClose: () => void }): void;
}>();

const open = ref(false);

function handleAction() {
  let shouldClose = true;
  const preventClose = () => {
    shouldClose = false;
  };

  emit("action", { preventClose });

  if (shouldClose) {
    open.value = false;
  }
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay
        class="bg-black/30 backdrop-blur-[4px] data-[state=open]:animate-overlay-show fixed inset-0 z-30" />
      <DialogContent
        class="z-[100] data-[state=open]:animate-content-show overflow-hidden fixed top-1/2 left-1/2 max-h-[85dvh] w-105 max-w-[calc(100dvw-2.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white text-black border-2 border-black shadow-dialog focus:outline-none">
        <DialogTitle
          class="m-0 px-4 py-2 border-b-2 border-black text-base! font-bold flex items-center gap-2 justify-between bg-yellow">
          <div class="flex flex-row items-center gap-2">
            <Icon :name="icon" />
            <span class="mt-1">{{ title }}</span>
          </div>
          <DialogClose
            as-child
            aria-label="Close"
            class="ease-in-out cursor-pointer">
            <Icon name="ph:x" />
          </DialogClose>
        </DialogTitle>
        <div class="flex flex-col w-full p-4 gap-6">
          <slot />

          <div class="flex flex-row w-full gap-4">
            <DialogClose as-child>
              <AppButton variant="secondary" size="dialog" class="w-full">
                {{ cancelText }}
              </AppButton>
            </DialogClose>
            <AppButton
              variant="primary"
              size="dialog"
              class="w-full"
              :disabled="disabled"
              @click="handleAction">
              {{ actionText }}
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
