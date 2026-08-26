<script setup lang="ts">
import { LazyModalConfirm, LazyModalEditUser } from "#components";
import type { SelectItem, TabsItem, TimelineItem } from "@nuxt/ui";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const breakpoints = useBreakpoints(breakpointsTailwind);
const mdAndLarger = breakpoints.greaterOrEqual("md");

const route = useRoute();
const userId = route.params.userId as NonEmptyString;

definePageMeta({
  middleware: ["auth"],
});

await useFetch(`/api/users/${userId}`, {
  key: `users-${userId}`,
});

const { data: userData } = useNuxtData<{
  user: User & { isMember?: boolean };
}>(`users-${userId}`);

if (!userData?.value?.user) {
  throw createError({
    statusCode: 404,
    statusMessage: "Používateľ/-ka nenájdená",
    message: `Používateľ/-ka s identifkačným číslom ${userId} zatiaľ neexistuje.`,
  });
}

useSeoMeta({
  title:
    `${userData?.value?.user.name} ${userData?.value?.user.surname}`.trim(),
  description: `Profil používateľa/-ky ${userData?.value?.user.name ?? ""} ${userData?.value?.user.surname ?? ""}.`,
});

const authClient = useAuthClient();

const toast = useToast();
const overlay = useOverlay();

const roleItems: SelectItem[] = [
  { label: "Používateľ/-ka", value: "user" },
  { label: "Organizátor/-ka", value: "organizer" },
  { label: "Junior organizátor/-ka", value: "junior_organizer" },
  { label: "Hlavný/-á rozhodca/-kyňa", value: "chief_adjudicator" },
  { label: "Člen/-ka tézového výboru", value: "motion_committee_member" },
  { label: "Administrátor/-ka", value: "admin" },
  {
    label: "Vývojár/-ka",
    value: "developer",
    disabled: true,
    class: "hidden",
  },
];

const tabItems = ref<TabsItem[]>([
  {
    label: "Osobné údaje",
    slot: "details",
  },
  {
    label: "Členstvá v SDA",
    slot: "memberships",
  },
  {
    label: "Registrácie na podujatia",
    disabled: true,
  },
  {
    label: "Platby",
    disabled: true,
  },
]);

const { data: membershipsData } = await useFetch(
  `/api/users/${userId}/memberships`,
  {
    key: `users-${userId}-memberships`,
  },
);

const { data: currentUserFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: currentUserData } =
  useNuxtData<typeof currentUserFetch.value>("users-me");

const memberships = computed<TimelineItem[]>(() => {
  return (membershipsData.value?.memberships ?? [])
    .sort((a, b) => (b.season ?? 0) - (a.season ?? 0))
    ?.map((m) => ({
      date: m.season.toString(),
      title: m.club?.name,
      icon: m.confirmed
        ? "i-ph-seal-check-bold"
        : new Date().getFullYear() > m.season
          ? "i-ph-seal-bold"
          : "i-ph-seal-question-bold",
      avatar: {
        class: m.confirmed
          ? "text-inverted! bg-success!"
          : new Date().getFullYear() > m.season
            ? "text-muted!"
            : "text-inverted! bg-warning!",
      },
    }));
});

const changeUserRole = async (newRole: unknown) => {
  if (typeof newRole !== "string") {
    return;
  }

  const { error } = await authClient.admin.setRole({
    userId: userId,
    role: newRole as UserRole,
  });

  if (error) {
    toast.add({
      color: "error",
      title: "Nepodarilo sa zmeniť rolu používateľa/-ky",
      description: error.message,
    });
    return;
  }
};

const editProfile = () => {
  const modal = overlay.create(LazyModalEditUser);
  modal.open({
    user: userData?.value?.user as User,
  });
};

const impersonateUser = async () => {
  const { error } = await authClient.admin.impersonateUser({
    userId: userId,
  });

  if (error) {
    toast.add({
      color: "error",
      title: "Nepodarilo sa prepnúť používateľa/-ku",
      description: error.message,
    });
    return;
  }

  await navigateTo("/");
  await refreshNuxtData();
};

const banningUser = ref(false);

const banUser = async () => {
  const modal = overlay.create(LazyModalConfirm);
  const instance = modal.open({
    title: "Zablokovať používateľa/-ku",
    description: `Naozaj chcete zablokovať používateľa/-ku ${userData?.value?.user.name ?? ""} ${userData?.value?.user.surname ?? ""}?`,
    color: "error",
  });

  const shouldDelete = await instance.result;

  if (!shouldDelete) {
    return;
  }

  banningUser.value = true;
  await authClient.admin.banUser({
    userId: userId,
  });

  await refreshNuxtData(`users-${userId}`);
  banningUser.value = false;
};

const unbanUser = async () => {
  const modal = overlay.create(LazyModalConfirm);
  const instance = modal.open({
    title: "Odblokovať používateľa/-ku",
    description: `Naozaj chcete odblokovať používateľa/-ku ${userData?.value?.user.name ?? ""} ${userData?.value?.user.surname ?? ""}?`,
    color: "success",
  });

  const shouldUnban = await instance.result;

  if (!shouldUnban) {
    return;
  }

  banningUser.value = true;
  await authClient.admin.unbanUser({
    userId: userId,
  });

  await refreshNuxtData(`users-${userId}`);
  banningUser.value = false;
};

const updateUserCredential = async (newCredential: number) => {
  await $fetch(`/api/users/${userId}/credential`, {
    method: "PUT",
    body: { credential: newCredential },
    onResponseError({ response }) {
      toast.add({
        color: "error",
        title: "Nepodarilo sa aktualizovať akreditáciu používateľa/-ky",
        description: `Chyba ${response.status}: ${response.statusText}`,
      });

      refreshNuxtData(`users-${userId}`);
    },
  });
};

const userCredential = ref(userData?.value?.user.credential ?? 0);
const userRole = ref(userData?.value?.user.role ?? "user");

watch(
  () => userData?.value?.user,
  (newUser) => {
    userCredential.value = newUser?.credential ?? 0;
    userRole.value = newUser?.role ?? "user";
  },
  { immediate: true },
);
</script>

<template>
  <UPage>
    <ProfileHeader :user="userData?.user!">
      <template #links>
        <template
          v-if="
            ['developer', 'admin'].includes(
              currentUserData?.user?.role ?? 'user',
            )
          ">
          <USelect
            v-model="userRole"
            :items="roleItems"
            :disabled="
              userData?.user?.role === 'developer' ||
              userData?.user?.id === currentUserData?.user?.id
            "
            variant="subtle"
            icon="i-ph-seal-check"
            :ui="{ leadingIcon: 'text-default' }"
            class="w-52"
            @update:modelValue="changeUserRole" />
          <UButton
            icon="i-ph-pencil-simple"
            color="neutral"
            variant="subtle"
            @click="editProfile">
            Upraviť profil
          </UButton>
          <UButton
            v-if="
              currentUserData?.user?.role === 'developer' &&
              userData?.user?.id !== currentUserData?.user?.id
            "
            icon="i-ph-visor"
            color="secondary"
            variant="subtle"
            @click="impersonateUser">
            Zosobniť
          </UButton>
          <UButton
            v-if="userData?.user?.banned"
            icon="i-ph-siren"
            color="success"
            :loading="banningUser"
            @click="unbanUser">
            Odblokovať
          </UButton>
          <UButton
            v-else
            icon="i-ph-siren"
            color="error"
            :loading="banningUser"
            @click="banUser">
            Zablokovať
          </UButton>
        </template>
      </template>
    </ProfileHeader>
    <UPageBody>
      <UAlert
        v-if="userData?.user?.id === currentUserData?.user?.id"
        color="info"
        icon="i-ph-identification-card-fill"
        orientation="horizontal"
        title="Prezeráte svoj vlastný profil. Pre úpravu všetkých údajov odporúčame použiť stránku vášho profilu."
        :actions="[
          {
            to: '/profile',
            label: 'Prejsť na profil',
            color: 'neutral',
          },
        ]"
        class="mb-2">
      </UAlert>
      <UTabs
        v-if="
          ['developer', 'admin', 'chief_adjudicator'].includes(
            currentUserData?.user?.role ?? 'user',
          )
        "
        :items="tabItems"
        variant="link"
        color="neutral"
        :ui="{
          content: 'mt-4 overflow-x-auto scrollbar-none',
        }">
        <template #details>
          <div
            class="flex flex-col lg:flex-row lg:justify-between gap-4 items-center sm:items-start">
            <ProfileDetails
              :user="userData?.user!"
              hide-credential
              class="pl-6 w-full">
              <template #extra>
                <span class="space-x-2 text-sm items-center flex text-pretty">
                  <UIcon name="i-ph-seal-warning-fill" class="size-5" />
                  <span>
                    Stupeň akreditácie :&nbsp;
                    <UInputNumber
                      v-model="userCredential"
                      size="xs"
                      :min="0"
                      :max="3"
                      class="w-24"
                      @update:model-value="updateUserCredential" />
                  </span>
                </span>
              </template>
            </ProfileDetails>
            <ProfileAwards
              :user-awards="userData?.user?.awards ?? []"
              alt-text="Používateľ/-ka zatiaľ nemá žiadne ocenenia."
              manageable />
          </div>
        </template>
        <template #memberships>
          <UTimeline
            v-if="memberships.length > 0"
            :items="memberships ?? []"
            :orientation="mdAndLarger ? 'horizontal' : 'vertical'"
            :ui="{
              item: 'flex-1 max-w-46 w-full',
            }"
            class="px-6 md:px-4" />
          <div v-else class="text-center text-sm text-muted">
            Používateľ/-ka nemá žiadne historické ani aktuálne členstvá v SDA.
          </div>
        </template>
      </UTabs>
      <template v-else>
        <USeparator />
        <div
          class="flex flex-col lg:flex-row lg:justify-between gap-4 items-center sm:items-start">
          <ProfileDetails
            :user="userData?.user!"
            hide-missing
            display-all
            class="pl-6 w-full" />
          <ProfileAwards
            :user-awards="userData?.user?.awards ?? []"
            alt-text="Používateľ/-ka zatiaľ nemá žiadne ocenenia." />
        </div>
      </template>
    </UPageBody>
  </UPage>
</template>
