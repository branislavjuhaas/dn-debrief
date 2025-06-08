<script setup lang="ts">
const allItems = [
  {
    name: "Môj profil",
    icon: "dn-smiley-sticker-r",
    link: "/me",
  },
  {
    name: "Moje registrácie",
    icon: "dn-books-r",
    link: "/me/registrations",
  },
  {
    name: "Moje výsledky",
    icon: "dn-scroll-r",
    link: "/me/results",
  },
  {
    name: "SEPARATOR",
  },
  {
    name: "Panel správy",
    icon: "dn-nut-r",
    link: "/me/manage",
    exclude: ["user", "guest"],
  },
  {
    name: "Vyhlásenie GDPR",
    icon: "dn-fingerprint-simple-r",
    link: "/privacy",
    include: ["mobile"],
  },
  {
    name: "SEPARATOR",
    exclude: ["user", "guest"],
    include: ["mobile"],
  },
  {
    name: "Odhlásiť sa",
    icon: "dn-plugs-r",
    link: "/auth/logout",
  },
];

const filteredItems = computed(() => {
  const user = {
    role: "developer",
  };

  const device = window.innerWidth < 640 ? "mobile" : "desktop";

  return allItems.filter((item) => {
    if (!item.exclude && !item.include) {
      return true;
    }

    let include = 2;
    if (!item.exclude || item.exclude.includes(user.role)) {
      include--;
    }
    if (!item.include || !item.include.includes(device)) {
      include--;
    }
    console.log(
      `Item: ${item.name}, Include: ${include}, Exclude: ${item.exclude}, Include Device: ${item.include}`,
    );
    return include > 0;
  });
});

const expand = ref(false);

const toggleExpand = (event: Event) => {
  event.preventDefault();
  expand.value = !expand.value;

  window.getSelection()?.removeAllRanges();
};

onMounted(() => {
  document.addEventListener("click", (event) => {
    if (!expand.value) return;

    const target = event.target as HTMLElement;
    if (!target.closest(".menu-interactable") && !target.closest(".expanded")) {
      expand.value = false;
    }
  });
});

onUnmounted(() => {
  document.removeEventListener("click", () => {});
});
</script>

<template>
  <button
    tabindex="0"
    aria-label="Toggle menu"
    class="flex sm:relative px-4 h-10 rounded-r-2xl border-2 border-black duration-150 items-center justify-center hover:bg-red hover:!text-white"
    :class="expand ? 'expanded' : ''"
    @click="toggleExpand">
    <Icon name="dn-sort-descending-r" class="w-5 h-5" />
    <Transition name="fade">
      <Teleport v-if="expand" to="body">
        <div
          class="sm:hidden fixed inset-0 bg-black/30 z-40 w-full h-full backdrop-blur-[2px]" />
      </Teleport>
    </Transition>
    <Transition name="fly">
      <div
        v-if="expand"
        class="flex flex-col absolute px-5 py-4 bg-white border-black border-2 max-sm:border-b-0 max-sm:rounded-b-none bottom-0 sm:bottom-10.5 sm:right-0 max-sm:left-1/2 max-sm:-translate-x-1/2 rounded-2xl gap-2 z-50 max-sm:w-[calc(100vw-2.5rem+2px)] max-h-[calc(100vh - 4rem)]">
        <template v-for="(item, index) in filteredItems" :key="index">
          <hr v-if="item.name === 'SEPARATOR'" class="border-black" >
          <nuxt-link
            v-else
            :to="item.link"
            class="menu-interactable flex text-nowrap items-center gap-2.5 text-black hover:text-red"
            role="menuitem">
            <Icon :name="item.icon ?? 'dn-question-r'" class="w-5 h-5" />
            <span class="mt-1">{{ item.name }}</span>
          </nuxt-link>
        </template>
      </div>
    </Transition>
  </button>
</template>

<style scoped>
@reference "~/assets/css/main.css";

button:hover > .icon {
  @apply invert;
}

.expanded {
  @apply bg-black! text-white!;
}

.expanded > .icon {
  @apply invert;
}

.menu-interactable:hover > .icon {
  filter: brightness(0) saturate(100%) invert(22%) sepia(88%) saturate(6820%)
    hue-rotate(358deg) brightness(110%) contrast(118%);
}

.fly-enter-active,
.fly-leave-active {
  transition: all 0.25s ease;
}

.fly-enter-from,
.fly-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
