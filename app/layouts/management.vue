<script setup lang="ts">
const userStore = useUserStore();
const links = useManagement(userStore.user);

const open = ref(false);
</script>

<template>
  <UMain>
    <UDashboardGroup class="!static !h-full">
      <UDashboardSidebar>
        <template #header="{ collapsed }">
          <UButton
            v-bind="{
              label: collapsed ? undefined : 'Panel správy',
            }"
            icon="ph:nut-fill"
            color="neutral"
            variant="ghost"
            to="/management"
            :square="collapsed"
            :ui="{
              base: 'font-bold text-highlighted w-full',
            }" />
        </template>

        <template #default="{ collapsed }">
          <UNavigationMenu
            :collapsed="collapsed"
            :items="links"
            orientation="vertical"
            tooltip
            popover />
        </template>
      </UDashboardSidebar>

      <div class="flex-1 flex flex-col overflow-hidden">
        <UDashboardNavbar>
          <template #left>
            <UDashboardSidebarToggle />
          </template>
        </UDashboardNavbar>

        <div class="flex-1 overflow-y-auto">
          <slot />
        </div>
      </div>
    </UDashboardGroup>
  </UMain>
</template>
