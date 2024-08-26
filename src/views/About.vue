<script setup>
const dedicatedTo = [
  "Barbore Svitkovej",
  "Natálii Michalcovej",
  "Richardovi Tomkovi",
  "Tatiane Migovej",
  "Jakubovi Koprdovi",
  "Nine Melicherovej",
  "Branislavovi Erkenovi",
  "Terézii Brišovej",
  "TK",
  "Branislavovi Faktorovi",
];

let system = "Cascade";

// If the domain is debrief.sda.sk, change the system name to DebRIEF
if (window.location.hostname === "debrief.sda.sk") {
  system = "DebRIEF";
} else if (window.location.hostname === "barca.juhaas.eu") {
  system = "Barca";
}

const version = "2024.0.1";
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">O systéme {{ system }}</h1>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      <div
        class="flex flex-row justify-between bg-white rounded-[1.25rem] p-5 gap-4 text-black vertical-center items-center">
        <p class="font-bold">Verzia</p>
        <p>{{ version }}</p>
      </div>
      <div
        class="flex flex-row justify-between bg-white rounded-[1.25rem] p-5 gap-4 text-black vertical-center items-center">
        <p class="font-bold">UI/UX</p>
        <p>DN July24 - mSDA</p>
      </div>
      <div
        class="flex flex-row justify-between bg-white rounded-[1.25rem] p-5 gap-4 text-black vertical-center items-center col-span-1 sm:col-span-2">
        <p class="font-bold">Autor</p>
        <p>© 2024 Branislav Juhás, všetky práva vyhradené</p>
      </div>
    </div>

    <div class="p-5">
      <p class="text-justify">
        Systém {{ system }} (Codename: DN Cascade) vznikol ako stret cieľov
        dvoch strán. Vedenie SDA sa snažilo o centralizáciu používateľských dát
        v na to určenom systéme, ktorý by umožňoval jednoduchý prístup a správu
        pre používateľov rovnako ako pre vedenie SDA. Autorov zámer bol splatiť
        pomyselný dlh voči organizáciu, ktorá mu otvorila oči nielen v oblasti
        kritického, ale čiastočne aj logického myslenia. Po niekoľkých mesiacoch
        rokovaní bolo dielo predstavené na valnom zhromaždení SDA na začiatku
        sezóny 2024/2025.
      </p>
      <br />
      <p class="text-justify">
        Existencia systému {{ system }} je možná len vďaka veľkému množstvu
        dobrovoľníckej práce v SDA. Toto dielo je venované
        {{ dedicatedTo.join(", ") }} a všetkým, ktorí prispeli k existencii SDA,
        akú som si vždy predstavoval: organizácia profesionálna, pokojná, bez
        zbytočných drám, naozaj inkluzívna pre všetkých, nesúdiaca a
        neodsudzujúca.
      </p>
    </div>

    <div
      class="flex flex-row justify-between bg-white rounded-[1.25rem] px-5 py-1.5 gap-4 text-black vertical-center items-center">
      <div class="grid grid-cols-[auto_auto] gap-4 place-items-center">
        <img src="./../assets/icons/dn.svg" alt="DN" class="w-5 h-5" />
        <p class="font-bold">Člen softwareovej rodiny DN</p>
      </div>
      <button class="form-primary vertical-center mb-1">
        <span>Stiahnuť certifikát</span>
      </button>
    </div>
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
