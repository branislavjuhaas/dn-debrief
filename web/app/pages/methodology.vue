<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { MethodologyFile } from "#shared/types/methodology";

definePageMeta({
  middleware: ["auth"],
});

useSeoMeta({
  title: "Metodika a materiály",
  description:
    "Knižnica metodických materiálov, pravidiel a dokumentov Slovenskej debatnej asociácie.",
});

const { data: methodologyFetch, status } = await useFetch("/api/methodology", {
  key: "methodology-files",
});

const { data: methodologyData } =
  useNuxtData<typeof methodologyFetch.value>("methodology-files");

const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");

const canManage = computed(() =>
  ["developer", "admin"].includes(userData.value?.user?.role ?? "user"),
);

const search = ref("");

const filteredFiles = computed(() => {
  const files = methodologyData.value?.files ?? [];
  const q = search.value.trim().toLowerCase();

  if (!q) return files;

  return files.filter((file) => {
    const nameMatch = file.name.toLowerCase().includes(q);
    const authorName =
      `${file.author?.name ?? ""} ${file.author?.surname ?? ""}`.toLowerCase();
    const authorMatch = authorName.includes(q);
    return nameMatch || authorMatch;
  });
});

const UButton = resolveComponent("UButton");
const UUser = resolveComponent("UUser");
const UIcon = resolveComponent("UIcon");
type MethodologyRow = NonNullable<
  typeof methodologyData.value
>["files"][number];

const columns: TableColumn<MethodologyRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Názov materiálu",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-ph-sort-ascending"
            : "i-ph-sort-descending"
          : "i-ph-funnel-simple",
        class: "-mx-2.5 font-bold text-highlighted",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      const url = row.original.publicUrl || row.original.fileUrl;
      return h(
        "a",
        {
          href: url,
          target: "_blank",
          rel: "noopener noreferrer",
          class:
            "font-medium text-primary hover:underline flex items-center gap-2",
        },
        [
          h(UIcon, {
            name: "i-ph-file-text",
            class: "size-5 text-muted shrink-0",
          }),
          h("span", { class: "font-semibold" }, row.original.name),
        ],
      );
    },
  },
  {
    id: "author",
    header: "Autor",
    cell: ({ row }) => {
      const author = row.original.author;
      const name = author?.name ?? "N/A";
      const surname = author?.surname ?? "";
      const fullName = `${name} ${surname}`.trim();

      if (!author) {
        return "N/A";
      }

      return h(
        UUser,
        {
          name: fullName,
          avatar: {
            src: author.image ?? undefined,
            alt: fullName,
          },
          to: `/users/${author.id}`,
          size: "xs",
        },
        {
          default: () =>
            h(
              "NuxtLink",
              {
                to: `/users/${author.id}`,
                class: "font-medium text-default hover:text-highlighted",
              },
              fullName,
            ),
        },
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Dátum pridania",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-ph-sort-ascending"
            : "i-ph-sort-descending"
          : "i-ph-funnel-simple",
        class: "-mx-2.5 font-bold text-highlighted",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: "",
    meta: {
      class: {
        td: "text-right",
      },
    },
    cell: ({ row }) => {
      const url = row.original.publicUrl || row.original.fileUrl;
      return h(UButton, {
        icon: "i-ph-download-simple",
        label: "Stiahnuť",
        color: "neutral",
        variant: "subtle",
        size: "xs",
        to: url,
        target: "_blank",
        download: true,
      });
    },
  },
];
</script>

<template>
  <UPage>
    <UPageHeader
      title="Metodika a materiály"
      description="Prehľad oficiálnych metodických príručiek, pravidiel formátov a vzdelávacích materiálov.">
      <template v-if="canManage" #links>
        <UButton
          to="/manage/content"
          label="Správa obsahu"
          icon="i-ph-gear"
          color="neutral"
          variant="subtle" />
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="flex flex-col gap-4">
        <div
          class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <UInput
            v-model="search"
            icon="i-ph-magnifying-glass"
            placeholder="Hľadať materiál alebo autora..."
            class="w-full sm:max-w-xs" />
          <span class="text-sm text-muted">
            Počet materiálov:
            <span class="font-bold text-highlighted">
              {{ filteredFiles.length }}
            </span>
          </span>
        </div>

        <UTable
          :data="filteredFiles"
          :columns="columns"
          :loading="status === 'pending'"
          class="w-full" />

        <div
          v-if="!status && filteredFiles.length === 0"
          class="text-center py-12 border border-dashed border-muted rounded-lg">
          <UIcon
            name="i-ph-folder-open"
            class="size-10 text-muted mx-auto mb-2" />
          <p class="text-sm font-medium text-highlighted">
            Nenašli sa žiadne materiály
          </p>
          <p class="text-xs text-muted mt-1">
            {{
              search
                ? "Skúste upraviť vyhľadávacie kritérium."
                : "V databáze zatiaľ nie sú nahrané žiadne metodické súbory."
            }}
          </p>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>
