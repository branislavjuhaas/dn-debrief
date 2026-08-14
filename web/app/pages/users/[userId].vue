<script setup lang="ts">
import { LazyModalConfirm, LazyModalEditUser } from "#components";
import type { SelectItem } from "@nuxt/ui";

const route = useRoute();
const userId = route.params.userId as NonEmptyString;

await useFetch(`/api/users/${userId}`, {
  key: `users-${userId}`,
  onResponseError({ response }) {
    if (response.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: "Používateľ/-ka nenájdený/-á",
      });
    }
  },
});

const { data: userData } = useNuxtData<{
  user: User;
}>(`users-${userId}`);

useSeoMeta({
  title:
    `${userData?.value?.user.name} ${userData?.value?.user.surname}`.trim(),
  description: `Profil používateľa/-ky ${userData?.value?.user.name ?? ""} ${userData?.value?.user.surname ?? ""}.`,
});

const authClient = useAuthClient();

const { data: currentUserFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: currentUserData } =
  useNuxtData<typeof currentUserFetch.value>("users-me");

const toast = useToast();
const overlay = useOverlay();

const roleOptions: SelectItem[] = [
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
</script>

<template>
  <ProfileHeader :user="userData?.user!">
    <template #links>
      <template
        v-if="
          ['developer', 'admin'].includes(currentUserData?.user?.role ?? 'user')
        ">
        <USelect
          :disabled="userData?.user?.role === 'developer'"
          :default-value="userData?.user?.role"
          :items="roleOptions"
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
          v-if="currentUserData?.user?.role === 'developer'"
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
</template>
