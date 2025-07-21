<template>
  <div class="flex flex-col gap-3">
    <div class="h-[1px] bg-black rounded-full" />
    <template v-for="(item, index) in navigationItems" :key="index">
      <ManagementSidebarLink :item="item as any" :open="open" />
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

const { navigationItems } = useManagementNavigation();
</script>
