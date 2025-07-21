<template>
  <div class="flex flex-col gap-3">
    <div class="h-[1px] bg-black rounded-full" />
    <template v-for="item in navigationItems">
      <ManagementSidebarLink :item="item" :open="open" />
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

const { navigationItems } = useManagementNavigation();
</script>
