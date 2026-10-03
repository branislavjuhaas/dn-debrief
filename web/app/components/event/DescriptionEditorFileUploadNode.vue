<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from "@tiptap/vue-3";

const props = defineProps(nodeViewProps);

const file = ref<File | null>(null);
const loading = ref(false);

const toast = useToast();

watch(file, async (newFile) => {
  if (!newFile) return;
  if (newFile.size > 10 * 1024 * 1024) {
    toast.add({
      title: "Neplatný súbor",
      description:
        "Súbor je príliš veľký. Prosím, nahrajte súbor menší ako 10MB.",
      color: "error",
    });
    return;
  }

  loading.value = true;

  try {
    const data = await $fetch("/api/events/files/upload", {
      method: "POST",
      body: {
        contentType: newFile.type || "application/octet-stream",
        fileExtension: newFile.name.includes(".")
          ? newFile.name.split(".").pop() || "bin"
          : "bin",
        filename: newFile.name,
      },
    });

    if (!data?.uploadUrl) return;

    await fetch(data.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": newFile.type || "application/octet-stream",
      },
      body: newFile,
    });

    const pos = props.getPos();
    if (typeof pos !== "number") {
      loading.value = false;
      return;
    }

    props.editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + 1 })
      .insertContentAt(pos, {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: newFile.name,
            marks: [
              {
                type: "code",
              },
              {
                type: "link",
                attrs: {
                  href: data.publicUrl,
                },
              },
            ],
          },
        ],
      })
      .run();
  } catch (error: any) {
    toast.add({
      title: "Chyba pri nahrávaní",
      description: error?.message || "Nepodarilo sa nahrať súbor.",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <NodeViewWrapper>
    <UFileUpload
      v-model="file"
      label="Nahrať súbor"
      description="PDF, DOCX, XLSX alebo iný súbor (max. 10MB)"
      :preview="false"
      class="min-h-48">
      <template #leading>
        <UAvatar
          :icon="loading ? 'i-ph-spinner' : 'i-ph-file'"
          size="xl"
          :ui="{ icon: [loading && 'animate-spin'] }" />
      </template>
    </UFileUpload>
  </NodeViewWrapper>
</template>
