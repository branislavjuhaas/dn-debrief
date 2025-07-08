<script setup lang="ts">
import { useToast } from "~/composables/useToast";
import {
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from "reka-ui";

const { toasts } = useToast();
</script>

<template>
  <ToastProvider>
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      :duration="toast.duration"
      class="flex flex-row text-black rounded-2xl shadow-dialog overflow-hidden border-2 border-black p-4 gap-4 items-center data-[state=open]:animate-slide-in data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipe-out"
      :class="toast.variant === 'info' ? 'bg-blue' : 'bg-yellow'">
      <div class="flex flex-col gap-3 w-full">
        <ToastTitle v-if="toast.title" class="font-bold">
          {{ toast.title }}
        </ToastTitle>
        <ToastDescription>
          {{ toast.text }}
        </ToastDescription>
        <ToastAction
          v-if="toast.action"
          class="flex flex-col mt-1"
          as-child
          :alt-text="toast.action.text">
          <AppButton
            :to="toast.action.to"
            variant="primary"
            size="dialog"
            @click="toast.action.onClick">
            {{ toast.action.text }}
          </AppButton>
        </ToastAction>
      </div>
      <ToastClose
        aria-label="Close"
        class="row-start-1 h-full col-start-2 text-black hover:text-red transition-colors duration-200 ease-in-out cursor-pointer">
        <Icon name="ph:x" />
      </ToastClose>
    </ToastRoot>
    <ToastViewport
      class="fixed bottom-19 right-8 flex flex-col gap-2 w-112 max-w-[calc(100dvw-4rem)] m-0 list-none z-[2147483647] outline-none" />
  </ToastProvider>
</template>
