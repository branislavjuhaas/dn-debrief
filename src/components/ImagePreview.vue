<script setup>
const props = defineProps({
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["remove"]);

function handleRemove() {
  emit("remove", props.fileName);
}
</script>

<template>
  <div
    class="relative max-w-full border-2 border-black rounded-[1.25rem] p-2 flex flex-col items-center justify-center gap-2">
    <img
      :src="filePath"
      alt="Image Preview"
      class="h-32 max-w-full object-contain" />
    <p>{{ props.fileName }}</p>
    <button
      class="absolute cursor-pointer top-2 right-2 rounded-[0.75rem] bg-white m-0 p-2"
      @click="handleRemove">
      <img
        src="./../assets/icons/trash.svg"
        alt="expand"
        class="cursor-pointer w-5" />
    </button>
  </div>
</template>

<style scoped>
button:hover > img {
  filter: brightness(0) saturate(100%) invert(32%) sepia(92%) saturate(6387%)
    hue-rotate(342deg) brightness(92%) contrast(96%);
}
</style>
