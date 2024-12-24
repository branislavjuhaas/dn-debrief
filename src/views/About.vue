<script setup>
// Import necessary Vue functions and custom hooks
import { version } from "../../package.json";

/**
 * Array of names dedicated to the system.
 * @type {string[]}
 */
const dedicatedTo = [
  "Barbore Svitkovej",
  "Natálii Michalcovej",
  "Richardovi Tomkovi",
  "Tatiane Migovej",
  "Jakubovi Koprdovi",
  "Nine Melicherovej",
  "Viere Kampošovej",
  "Branislavovi Erkenovi",
  "Terézii Brišovej",
  "Tíkeji",
  "Branislavovi Faktorovi",
];

/**
 * The name of the system. It can be "DN Cascade", "DebRIEF", or "Barca" depending on the hostname.
 * @type {string}
 */
let system = "DN Cascade";

/**
 * Function to set the system name based on the hostname.
 * If the hostname is "debrief.sda.sk", the system name is set to "DebRIEF".
 * If the hostname is "barca.juhaas.eu", the system name is set to "Barca".
 * Otherwise, the system name remains "DN Cascade".
 */
function setSystemName() {
  if (window.location.hostname === "debrief.sda.sk") {
    system = "DebRIEF";
  } else if (window.location.hostname === "barca.juhaas.eu") {
    system = "Barca";
  }
}

// Call the function to set the system name
setSystemName();
</script>

<template>
  <div class="gap-4">
    <h1>O systéme {{ system }}</h1>
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
        Systém {{ system }} (Codename: DN Cascade) je komplexný nástroj
        navrhnutý primárne pre potreby SDA na centralizáciu dát. Je vyvinutý s
        dôrazom na efektívnosť, škálovateľnosť a používateľský zážitok. Projekt
        zahŕňa širokú škálu funkcií ako napríklad overovanie používateľov a
        správu dát, všetko prispôsobené pre poskytnutie bezproblémového
        ovládania pre používateľov. Platforma je robustná, a postavená pomocou
        najnovších technológií pre zabezpečenie jej škálovateľnosti a
        efektívnosti.
      </p>
      <br />
      <p class="text-justify">
        Existencia systému je možná len vďaka veľkému množstvu obetovaného
        posledného autorovho voľného času na pokraji technologického vyhorenia.
        Toto dielo je venované
        {{ dedicatedTo.join(", ") }} a všetkým, ktorí prispeli k existencii SDA,
        o akej som vždy sníval: organizácia profesionálna, pokojná, bez
        zbytočných drám, naozaj inkluzívna pre všetkých, nesúdiaca a
        neodsudzujúca.
      </p>
    </div>

    <div
      class="flex flex-row justify-between bg-white rounded-[1.25rem] px-5 py-1.5 gap-4 text-black vertical-center items-center">
      <div class="grid grid-cols-[auto_auto] gap-4 place-items-center">
        <img src="./../assets/icons/dn.svg" alt="DN" class="w-5 h-5" />
        <a href="https://dn.juhaas.eu" class="font-bold">
          Člen softwareovej rodiny DN
        </a>
      </div>
      <a
        href="https://firebasestorage.googleapis.com/v0/b/dn-cascade.appspot.com/o/DN%20Family%2FCertificate%20of%20DN%20membership%20-%20Copyright.pdf?alt=media&token=68568477-390d-48e2-ae5d-5f3dce147bbe"
        class="form-primary vertical-center mb-1">
        <span>Stiahnuť certifikát</span>
      </a>
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
