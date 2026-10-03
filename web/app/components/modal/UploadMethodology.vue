<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import z from "zod";

const emit = defineEmits<{
  close: [boolean];
}>();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Názov musí mať aspoň 2 znaky")
    .max(255, "Názov môže mať maximálne 255 znakov"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  name: "",
});

const selectedFile = ref<File | null>(null);
const fileError = ref<string | null>(null);
const isUploading = ref(false);

const toast = useToast();

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;

  fileError.value = null;

  if (!file) {
    selectedFile.value = null;
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    fileError.value = `Súbor je príliš veľký (${formatFileSize(file.size)}). Maximálna povolená veľkosť je 10 MB.`;
    selectedFile.value = null;
    target.value = "";
    return;
  }

  selectedFile.value = file;

  // Auto-fill suggested human-readable name if currently empty
  if (!state.name) {
    const rawName = file.name.replace(/\.[^/.]+$/, "");
    state.name = rawName
      .replace(/[-_]+/g, " ")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/^./, (str) => str.toUpperCase());
  }
};

const removeSelectedFile = () => {
  selectedFile.value = null;
  fileError.value = null;
};

const onSubmit = async (_event: FormSubmitEvent<Schema>) => {
  if (!selectedFile.value) {
    fileError.value = "Vyberte súbor na nahratie";
    return;
  }

  if (selectedFile.value.size > MAX_FILE_SIZE) {
    fileError.value = "Súbor nesmie presiahnuť 10MB";
    return;
  }

  isUploading.value = true;
  let createdFileId: number | null = null;

  try {
    const createData = await $fetch<{
      uploadUrl: string;
      key: string;
      file: { id: number; name: string };
    }>("/api/methodology", {
      method: "POST",
      body: {
        name: state.name.trim(),
        contentType: selectedFile.value.type || "application/octet-stream",
        size: selectedFile.value.size,
        filename: selectedFile.value.name,
      },
    });

    createdFileId = createData.file.id;

    const uploadResponse = await fetch(createData.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": selectedFile.value.type || "application/octet-stream",
      },
      body: selectedFile.value,
    });

    if (!uploadResponse.ok) {
      throw new Error("Nepodarilo sa uložiť súbor do úložiska.");
    }

    toast.add({
      title: "Metodický materiál nahraný",
      description: `Súbor "${state.name}" bol úspešne pridaný.`,
      color: "success",
    });

    await refreshNuxtData("methodology-files");
    emit("close", true);
  } catch (error: any) {
    // If DB record was created but upload failed, clean up
    if (createdFileId) {
      await $fetch(`/api/methodology/${createdFileId}`, {
        method: "DELETE",
      }).catch(() => {});
    }

    toast.add({
      title: "Chyba pri nahrávaní",
      description:
        error?.data?.message ||
        error?.message ||
        "Nepodarilo sa nahrať metodický súbor.",
      color: "error",
    });
  } finally {
    isUploading.value = false;
  }
};
</script>

<template>
  <UModal
    title="Nahrať metodický materiál"
    :close="{ onClick: () => emit('close', false) }">
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit">
        <!-- File input -->
        <UFormField
          label="Súbor"
          name="file"
          description="Maximálna povolená veľkosť je 10 MB (PDF, DOCX, XLSX, a iné)."
          :error="fileError || undefined"
          required>
          <div v-if="!selectedFile" class="flex flex-col gap-2">
            <label
              class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:bg-elevated/50 transition-colors">
              <UIcon
                name="i-ph-cloud-arrow-up"
                class="size-10 text-muted mb-2" />
              <span class="text-sm font-medium text-highlighted">
                Kliknite pre výber súboru
              </span>
              <span class="text-xs text-muted mt-1"> Maximálne 10 MB </span>
              <input type="file" class="hidden" @change="onFileChange" />
            </label>
          </div>

          <div
            v-else
            class="flex items-center justify-between p-3 rounded-lg bg-elevated border border-muted">
            <div class="flex items-center gap-3 min-w-0">
              <UIcon name="i-ph-file" class="size-6 text-primary shrink-0" />
              <div class="min-w-0">
                <p class="text-sm font-medium text-highlighted truncate">
                  {{ selectedFile.name }}
                </p>
                <p class="text-xs text-muted">
                  {{ formatFileSize(selectedFile.size) }}
                </p>
              </div>
            </div>
            <UButton
              icon="i-ph-x"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Odstrániť vybraný súbor"
              :disabled="isUploading"
              @click="removeSelectedFile" />
          </div>
        </UFormField>

        <!-- Name input -->
        <UFormField
          label="Názov súboru"
          name="name"
          description="Zadajte zrozumiteľný názov alebo popis obsahu súboru pre používateľov"
          required>
          <UInput
            v-model="state.name"
            class="w-full"
            placeholder="napr. Pravidlá formátu Karl Popper"
            :disabled="isUploading" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            color="neutral"
            variant="subtle"
            label="Zrušiť"
            :disabled="isUploading"
            @click="emit('close', false)" />
          <UButton
            type="submit"
            color="primary"
            variant="solid"
            icon="i-ph-upload-simple"
            label="Nahrať materiál"
            :loading="isUploading" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
