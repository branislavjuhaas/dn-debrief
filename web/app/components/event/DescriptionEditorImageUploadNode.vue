<script setup lang="ts">
import type { NodeViewProps } from "@tiptap/vue-3";
import { NodeViewWrapper } from "@tiptap/vue-3";

const props = defineProps<NodeViewProps>();

const file = ref<File | null>(null);
const loading = ref(false);

// watch(file, async (newFile) => {
//   if (!newFile) return;

//   loading.value = true;

//   const reader = new FileReader();
//   reader.onload = async (e) => {
//     const dataUrl = e.target?.result as string;
//     if (!dataUrl) {
//       loading.value = false;
//       return;
//     }

//     // Simulate upload delay
//     await new Promise((resolve) => setTimeout(resolve, 1000));

//     const pos = props.getPos();
//     if (typeof pos !== "number") {
//       loading.value = false;
//       return;
//     }

//     props.editor
//       .chain()
//       .focus()
//       .deleteRange({ from: pos, to: pos + 1 })
//       .setImage({ src: dataUrl })
//       .run();

//     loading.value = false;
//   };
//   reader.readAsDataURL(newFile);
// });

const toast = useToast();

watch(file, async (newFile) => {
  if (!newFile) return;
  if (newFile.size > 2 * 1024 * 1024) {
    toast.add({
      title: "Neplatný soubor",
      description:
        "Soubor je príliš velký. Prosím, nahrajte obrázok menší ako 2MB.",
      color: "error",
    });
    return;
  }
  if (!newFile.type.startsWith("image/")) {
    toast.add({
      title: "Neplatný soubor",
      description: "Prosím, nahrajte obrázok.",
      color: "error",
    });
    return;
  }

  const data = await $fetch("/api/events/files/upload", {
    method: "POST",
    body: {
      contentType: newFile.type,
      fileExtension: newFile.name.split(".").pop(),
    },
  });
});
</script>

<template>
  <NodeViewWrapper>
    <UFileUpload
      v-model="file"
      accept="image/*"
      label="Upload an image"
      description="SVG, PNG, JPG or GIF (max. 2MB)"
      :preview="false"
      class="min-h-48">
      <template #leading>
        <UAvatar
          :icon="loading ? 'i-lucide-loader-circle' : 'i-lucide-image'"
          size="xl"
          :ui="{ icon: [loading && 'animate-spin'] }" />
      </template>
    </UFileUpload>
  </NodeViewWrapper>
</template>
