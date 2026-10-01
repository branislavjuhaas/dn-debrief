<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { useObjectUrl } from "@vueuse/core";
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

const props = defineProps<{
  file?: File;
}>();

const emit = defineEmits<{
  close: [Blob | undefined];
}>();

const fileRef = computed(() => props.file);
const imageSrc = useObjectUrl(fileRef);
const cropperRef = useTemplateRef("cropper");

const isReady = ref(false);

const handleConfirm = () => {
  const result = cropperRef.value?.getResult();
  if (!result?.canvas) return;

  const originalCanvas = result.canvas;
  const targetWidth = 645;

  // Calculate height to preserve the aspect ratio
  const targetHeight = Math.round(
    (originalCanvas.height / originalCanvas.width) * targetWidth,
  );

  // Create an offscreen canvas for resizing
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = targetWidth;
  outputCanvas.height = targetHeight;

  const ctx = outputCanvas.getContext("2d");
  if (ctx) {
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(originalCanvas, 0, 0, targetWidth, targetHeight);
  }

  outputCanvas.toBlob((blob) => {
    if (blob) {
      emit("close", blob);
    }
  }, "image/jpeg");
};
</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', undefined) }"
    title="Upravte náhľadovú snímku">
    <template #body>
      <Cropper
        v-if="imageSrc"
        ref="cropper"
        :src="imageSrc"
        :stencil-props="{ aspectRatio: 21 / 9 }"
        :min-width="645"
        @ready="isReady = true" />
      <USkeleton v-if="!imageSrc || !isReady" class="w-full h-52" />
    </template>

    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton
          color="neutral"
          label="Zrušiť"
          variant="subtle"
          block
          @click="emit('close', undefined)" />
        <UButton
          label="Potvrdiť"
          color="success"
          block
          @click="handleConfirm" />
      </div>
    </template>
  </UModal>
</template>
