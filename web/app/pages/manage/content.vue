<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { LazyModalConfirm, LazyModalUploadMethodology } from "#components";
import type { MethodologyFile } from "#shared/types/methodology";

definePageMeta({
  layout: "manage",
  middleware: ["auth"],
  allowedRoles: ["developer", "admin"],
});

useSeoMeta({
  title: "Správa obsahu",
  description:
    "Správa metodických materiálov, pravidiel a dokumentov pre používateľov platformy DebRIEF.",
});

const { data: methodologyFetch, status } = await useFetch("/api/methodology", {
  key: "methodology-files",
});

const { data: methodologyData } =
  useNuxtData<typeof methodologyFetch.value>("methodology-files");

const UButton = resolveComponent("UButton");
const UUser = resolveComponent("UUser");
const UIcon = resolveComponent("UIcon");
const overlay = useOverlay();
const toast = useToast();

const openUploadModal = () => {
  const modal = overlay.create(LazyModalUploadMethodology);
  modal.open();
};

const deleteMethodologyFile = async (file: MethodologyFile) => {
  const modal = overlay.create(LazyModalConfirm);
  const instance = modal.open({
    title: "Vymazať metodický materiál",
    description: `Naozaj chcete vymazať súbor "${file.name}"? Táto akcia je nevratná.`,
    color: "error",
  });

  const shouldDelete = await instance.result;

  if (shouldDelete) {
    await $fetch(`/api/methodology/${file.id}`, {
      method: "DELETE",
      onResponseError() {
        toast.add({
          title: "Nepodarilo sa vymazať súbor",
          description: "Skúste to znova.",
          color: "error",
        });
      },
      async onResponse({ response }) {
        if (response.ok) {
          toast.add({
            title: `Súbor "${file.name}" bol úspešne vymazaný`,
            color: "success",
          });
          await refreshNuxtData("methodology-files");
        }
      },
    });
  }
};

type MethodologyRow = NonNullable<
  typeof methodologyData.value
>["files"][number];

const columns: TableColumn<MethodologyRow>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "ID",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-ph-sort-ascending"
            : "i-ph-sort-descending"
          : "i-ph-funnel-simple",
        class: "-mx-2.5 font-bold text-highlighted",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => `#${row.original.id}`,
  },
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
            "font-medium text-primary hover:underline flex items-center gap-1.5",
        },
        [
          h(UIcon, {
            name: "i-ph-file-text",
            class: "size-4 text-muted shrink-0",
          }),
          h(
            "span",
            { class: "truncate max-w-xs md:max-w-md" },
            row.original.name,
          ),
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
        label: "Dátum nahratia",
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
      return h("div", { class: "flex items-center justify-end gap-1.5" }, [
        h(UButton, {
          icon: "i-ph-arrow-square-out",
          color: "neutral",
          variant: "ghost",
          size: "xs",
          to: url,
          target: "_blank",
          "aria-label": "Otvoriť súbor",
        }),
        h(UButton, {
          icon: "i-ph-trash",
          color: "error",
          variant: "ghost",
          size: "xs",
          "aria-label": "Vymazať materiál",
          onClick: () => deleteMethodologyFile(row.original),
        }),
      ]);
    },
  },
];
</script>

<template>
  <div class="w-full h-full">
    <UDashboardPanel id="content">
      <template #header>
        <UDashboardNavbar title="Správa obsahu" :ui="{ right: 'gap-3' }">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
        <UDashboardToolbar
          class="flex flex-col sm:flex-row items-center justify-between gap-4 max-sm:py-4">
          <span class="text-muted text-sm">
            Počet metodických materiálov:
            <span class="font-bold text-highlighted">
              {{ methodologyData?.files.length || 0 }}
            </span>
          </span>
          <div class="flex items-center gap-2">
            <UButton
              label="Nahrať metodiku"
              color="primary"
              variant="solid"
              icon="i-ph-plus"
              @click="openUploadModal" />
          </div>
        </UDashboardToolbar>
      </template>

      <template #body>
        <UTable
          :data="methodologyData?.files ?? []"
          :columns="columns"
          :loading="status === 'pending'"
          class="flex-1" />
      </template>
    </UDashboardPanel>
  </div>
</template>
