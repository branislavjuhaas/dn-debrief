<template>
  <div class="flex flex-col w-full pl-0 pr-5 items-start">
    <div
      class="flex flex-col max-w-[calc(50%+660px+0.625rem)] w-full pt-18 pl-20 gap-16 transition-all duration-300"
      :class="open ? 'md:pl-67.5' : ''">
      <div
        class="fixed left-0 top-0 flex flex-col h-full justify-between gap-4 bg-white border-r-2 text-black pt-25 pb-20 px-5 overflow-hidden transition-all duration-300 w-15"
        :class="open ? 'md:w-62.5' : ''">
        <div class="flex flex-col gap-8">
          <button
            @click="open = !open"
            class="flex flex-row items-center justify-between gap-2">
            <div class="flex flex-row items-center gap-2">
              <Icon name="ph:nut-fill" />
              <span
                class="hidden text-base font-bold -mb-1 uppercase text-nowrap"
                :class="open ? 'md:block' : ''">
                Panel správy
              </span>
            </div>
            <Icon
              name="ph:text-outdent"
              class="hidden"
              :class="open ? 'md:block' : ''" />
          </button>
          <div class="flex flex-col gap-3">
            <div class="h-[1px] bg-black rounded-full" />
            <template v-for="item in navigationItems">
              <NuxtLink
                v-if="!item.separator"
                :key="item.label"
                :to="item.to"
                active-class="font-bold text-black!"
                class="flex flex-row items-center gap-2 hover:text-red w-full">
                <Icon
                  :name="
                    $route.path === item.to
                      ? item.icon
                        ? `${item.icon}-fill`
                        : 'ph:question-fill'
                      : item.icon || 'ph:question'
                  " />
                <span
                  class="-mb-1 hidden w-full truncate"
                  :class="open ? 'md:inline' : ''">
                  {{ item.label }}
                </span>
                <Icon
                  v-if="item.external"
                  name="ph:arrow-square-up-right"
                  class="hidden"
                  :class="open ? 'md:inline' : ''" />
              </NuxtLink>
              <div v-else class="h-[1px] bg-black rounded-full" />
            </template>
          </div>
        </div>
        <NuxtLink
          to="https://casp.sda.sk/studio"
          class="flex flex-row items-center gap-2 hover:text-red w-full">
          <Icon name="ph:table" />
          <span
            class="-mb-1 hidden w-full truncate"
            :class="open ? 'md:inline' : ''">
            Štúdio Supabase
          </span>
          <Icon
            name="ph:arrow-square-up-right"
            class="hidden"
            :class="open ? 'md:inline' : ''" />
        </NuxtLink>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const open = ref(true);

const navigationItems = [
  {
    label: "Správa používateľov",
    icon: "ph:users-four",
    to: "/management/users",
  },
  { label: "Správa klubov", icon: "ph:buildings", to: "/management/clubs" },
  { separator: true },
  {
    label: "Správa podujatí",
    icon: "ph:globe-hemisphere-west",
    to: "/management/events",
  },
  {
    label: "Rozhodovanie",
    icon: "ph:gavel",
    to: "/management/adjudicators",
  },
  {
    label: "Modul SP",
    icon: "ph:lightning",
    to: "/msp",
    external: true,
  },
  { separator: true },
  {
    label: "Správa obsahu",
    icon: "ph:newspaper-clipping",
    to: "/management/content",
  },
  {
    label: "Správa pladieb",
    icon: "ph:invoice",
    to: "/dev/gallery",
  },
  { separator: true },
  {
    label: "Správa DK Sučany",
    icon: "ph:bank",
    to: "/clubs/1",
    external: true,
  },
  {
    label: "Správa DK Gym. Varšavská cesta",
    icon: "ph:bank",
    to: "/clubs/2",
    external: true,
  },
];
</script>

<style scoped></style>
