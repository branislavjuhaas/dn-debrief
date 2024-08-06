<script setup>
const dedicatedTo = [
  "Barbore Svitkovej",
  "Natálii Michalcovej",
  "Richardovi Tomkovi",
  "Tatiane Migovej",
  "Jakubovi Koprdovi",
  "Nine Melicherovej",
  "Terézii Brišovej",
  "TK",
  "Branislavovi Faktorovi",
  "Júlii J.",
];

const version = "2024.0.1";
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">O systéme DebRIEF</h1>
    <div class="grid grid-cols-4 gap-4">
      <div
        class="flex flex-row justify-between bg-white rounded-[1.25rem] p-5 gap-4 text-black vertical-center items-center">
        <p class="font-bold">Verzia</p>
        <p>{{ version }}</p>
      </div>
      <div
        class="flex flex-row justify-between bg-white rounded-[1.25rem] p-5 gap-4 text-black vertical-center items-center">
        <p class="font-bold">Technológie</p>
        <p>Vue.js, Firebase</p>
      </div>
      <div
        class="flex flex-row justify-between bg-white rounded-[1.25rem] p-5 gap-4 text-black vertical-center items-center col-span-2">
        <p class="font-bold">© 2024 Branislav Juhás</p>
        <p>všetky práva vyhradené</p>
      </div>
    </div>

    <h3>Toto dielo je venované</h3>
    {{ dedicatedTo.join(", ") }} a všetkým, ktorí prispeli k budovaniu SDA, akú
    som si ju vždy prial, bez zbytočných drám, konfliktov a normalizačných
    tendencií. SDA, ktorá je skutočne inkluzívna voči všetkým, ktorá neodsudzuje
    na základe pravidiel tvorených za pochodu.
  </div>
</template>

<style scoped>
h3 {
  @apply text-2xl font-bold mt-4;
}

h4 {
  @apply text-2xl;
}
</style>
