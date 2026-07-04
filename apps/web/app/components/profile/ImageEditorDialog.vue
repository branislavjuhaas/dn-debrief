<script setup lang="ts">
import { useUserStore } from "~/stores/user";
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { Cropper, CircleStencil } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

const emits = defineEmits(["close"]);

const cropper = useTemplateRef("cropper");

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MIN_DIMENSIONS = { width: 200, height: 200 };
const MAX_DIMENSIONS = { width: 4096, height: 4096 };
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const userStore = useUserStore();

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
};

const schema = z.object({
  avatar: z
    .instanceof(File, {
      message: "Prosím, vyberte snímku.",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `Snímka je príliš veľká, Prosím, vyberte snímku menšiu než ${formatBytes(MAX_FILE_SIZE)}.`,
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Prosím, nahrajte platný obrázok (JPEG, PNG alebo WebP).",
    })
    .refine(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const meetsDimensions =
                img.width >= MIN_DIMENSIONS.width &&
                img.height >= MIN_DIMENSIONS.height &&
                img.width <= MAX_DIMENSIONS.width &&
                img.height <= MAX_DIMENSIONS.height;
              resolve(meetsDimensions);
            };
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }),
      {
        message: `Snímka má neplatné rozmery. Prosím, nahrajte snímku medzi ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} a ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height} pixelmi.`,
      },
    ),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  avatar: undefined,
});

function createObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

const fileError = ref<string | null>(null);

const handleFileChange = async (file: File | null) => {
  fileError.value = null;

  if (file) {
    const result = await schema.safeParseAsync({ avatar: file });

    if (result.success) {
      if (state.avatar) URL.revokeObjectURL(state.avatar);

      state.avatar = URL.createObjectURL(file);
    } else {
      fileError.value = result.error?.issues?.[0]?.message || "Neplatný súbor.";
    }
  } else {
    if (state.avatar) URL.revokeObjectURL(state.avatar);
    avatarPreview.value = null;
    state.avatar = undefined;
  }
};

const uploading = ref(false);

const handleUpload = async () => {
  uploading.value = true;

  const { canvas } = cropper.value.getResult();
  if (canvas) {
    const formData = new FormData();
    canvas.toBlob(async (blob) => {
      formData.append("avatar", blob);

      const result = await $fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      if (!result) {
        fileError.value = "Nepodarilo sa uložiť profilovú snímku.";
        uploading.value = false;
        state.avatar = undefined;
        return;
      }

      const { user } = await $fetch("/api/users/me");

      if (!user) {
        return;
      }

      userStore.$patch({ user });

      navigateTo("/profile");
    }, "image/jpeg");
  }
};
</script>

<template>
  <UModal
    title="Upraviť profilovú snímku"
    :dismissible="false"
    :ui="{ footer: 'justify-end' }">
    <template #body>
      <UAlert v-if="fileError" :title="fileError" color="error" class="mb-4" />
      <UFileUpload
        v-if="!state.avatar"
        @update:model-value="handleFileChange"
        accept="image/jpeg,image/png,image/webp"
        color="neutral"
        highlight
        :icon="false"
        :preview="false"
        label="Nahrajte vašu profilovú snímku"
        description="JPEG, PNG alebo WEBP (max. 2MB)"
        class="w-full">
        <template #leading>
          <span
            class="mx-auto inline-flex items-center justify-center shrink-0 select-none rounded-full align-middle bg-elevated size-48 text-4xl"
            aria-hidden="true">
            <NuxtImg
              v-if="userStore.user?.image"
              :src="userStore.user.image"
              alt=""
              width="192"
              height="192"
              class="h-full w-full rounded-[inherit] object-cover" />

            <span v-else class="font-medium truncate">
              {{ userStore.fullName }}
            </span>
          </span></template
        >
      </UFileUpload>
      <Cropper
        ref="cropper"
        v-if="state.avatar"
        :src="state.avatar"
        :canvas="{
          minHeight: 200,
          minWidth: 200,
          maxHeight: 2048,
          maxWidth: 2048,
        }"
        :stencil-component="CircleStencil" />
    </template>
    <template #footer>
      <UButton
        label="Zrušiť"
        color="neutral"
        variant="outline"
        :disabled="uploading"
        @click="emits('close')" />
      <UButton
        label="Uložiť zmeny"
        color="primary"
        icon="i-ph-checks"
        :disabled="!state.avatar"
        :loading="uploading"
        @click="handleUpload" />
    </template>
  </UModal>
</template>
