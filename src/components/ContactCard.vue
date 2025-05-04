<script setup>
/**
 * ContactList component props
 * @property {string} title - Title for the contact list
 * @property {Array<{ name: string, surname: string }>} contacts - Array of contact objects
 */
const props = defineProps({
  contact: { type: Object, required: true },
});
</script>

<template>
  <a
    :key="contact.id"
    :href="'mailto:' + contact.email"
    class="flex flex-row border-2 border-black rounded-[1.25rem] px-5 justify-between py-2 hover:border-red">
    <div class="flex flex-row items-center gap-2">
      <img src="./../assets/icons/educator.svg" alt="" class="w-5 h-5" />
      <p class="font-bold mt-1">{{ contact.name }} {{ contact.surname }}</p>
    </div>
    <p class="col-span-2 mt-1">{{ contact.phone }}</p>
  </a>
</template>

<style scoped>
a:hover img {
  filter: brightness(0) saturate(100%) invert(32%) sepia(92%) saturate(6387%)
    hue-rotate(342deg) brightness(92%) contrast(96%);
}
</style>
