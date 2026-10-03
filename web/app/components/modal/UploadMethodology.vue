<script lang="ts" setup>
import type { FormSubmitEvent, TabsItem } from "@nuxt/ui";
import z from "zod";

const emit = defineEmits<{
  close: [boolean];
}>();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const selectedTab = ref<"file" | "external">("file");

const tabItems: TabsItem[] = [
  {
    label: "Nahrať súbor",
    icon: "i-ph-upload-simple",
    value: "file",
  },
  {
    label: "Externý odkaz",
    icon: "i-ph-link",
    value: "external",
  },
];

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Názov musí mať aspoň 2 znaky")
      .max(255, "Názov môže mať maximálne 255 znakov"),
    url: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (selectedTab.value === "external") {
      if (!data.url || !data.url.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL adresa je povinná",
          path: ["url"],
        });
      } else {
        try {
          const parsed = new URL(data.url.trim());
          if (!["http:", "https:"].includes(parsed.protocol)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "URL musí začínať s http:// alebo https://",
              path: ["url"],
            });
          }
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Neplatný formát URL adresy",
            path: ["url"],
          });
        }
      }
    }
  });

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  name: "",
  url: "",
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
  if (selectedTab.value === "file") {
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
        uploadUrl: string | null;
        key: string | null;
        file: { id: number; name: string };
      }>("/api/methodology", {
        method: "POST",
        body: {
          name: state.name.trim(),
          isExternal: false,
          contentType: selectedFile.value.type || "application/octet-stream",
          size: selectedFile.value.size,
          filename: selectedFile.value.name,
        },
      });

      createdFileId = createData.file.id;

      if (!createData.uploadUrl) {
        throw new Error("Nepodarilo sa vygenerovať adresu pre nahratie.");
      }

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
  } else {
    // External URL flow
    isUploading.value = true;

    try {
      await $fetch("/api/methodology", {
        method: "POST",
        body: {
          name: state.name.trim(),
          isExternal: true,
          url: state.url?.trim(),
        },
      });

      toast.add({
        title: "Externý materiál pridaný",
        description: `Odkaz "${state.name}" bol úspešne uložený.`,
        color: "success",
      });

      await refreshNuxtData("methodology-files");
      emit("close", true);
    } catch (error: any) {
      toast.add({
        title: "Chyba pri pridávaní odkazu",
        description:
          error?.data?.message ||
          error?.message ||
          "Nepodarilo sa pridať externý materiál.",
        color: "error",
      });
    } finally {
      isUploading.value = false;
    }
  }
};
</script>

<template>
  <UModal
    title="Pridať metodický materiál"
    :close="{ onClick: () => emit('close', false) }">
    <template #body>
      <div class="space-y-4">
        <UTabs v-model="selectedTab" :items="tabItems" class="w-full" />

        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="onSubmit">
          <!-- File input (when file tab selected) -->
          <UFormField
            v-if="selectedTab === 'file'"
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

          <!-- External URL input (when external tab selected) -->
          <UFormField
            v-else
            label="URL adresa súboru"
            name="url"
            description="Zadajte odkaz na externý dokument (napr. Disk Google, PDF online alebo web)"
            required>
            <UInput
              v-model="state.url"
              class="w-full"
              placeholder="https://drive.google.com/..."
              icon="i-ph-link"
              :disabled="isUploading" />
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
              :placeholder="
                selectedTab === 'file'
                  ? 'napr. Pravidlá formátu Karl Popper'
                  : 'napr. Rozhodcovské manuály na Google Drive'
              "
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
              :icon="
                selectedTab === 'file' ? 'i-ph-upload-simple' : 'i-ph-link'
              "
              :label="
                selectedTab === 'file' ? 'Nahrať materiál' : 'Pridať odkaz'
              "
              :loading="isUploading" />
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>
