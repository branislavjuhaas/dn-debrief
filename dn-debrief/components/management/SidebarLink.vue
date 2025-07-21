<template>
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
    <span class="-mb-1 hidden w-full truncate" :class="open ? 'md:inline' : ''">
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

<script setup lang="ts">
defineProps<{
  item: {
    label: string;
    to: string;
    icon?: string;
    external?: boolean;
    separator?: boolean;
  };
  open: boolean;
}>();
</script>
