<script setup lang="ts">
import type { Event } from "#shared/types/event";
import { LazyModalThumbnailCropper } from "#components";
import z from "zod";
import {
  EVENT_TYPES,
  EVENT_TYPE_OPTIONS,
  LEAGUES,
  LEAGUE_OPTIONS,
  REGIONS,
  REGION_OPTIONS,
  getScheduleBounds,
  formatScheduleBounds,
  slugify,
} from "#shared/utils/events";

const props = withDefaults(
  defineProps<{
    mode?: "create" | "edit";
  }>(),
  {
    mode: "create",
  },
);

const toast = useToast();
const overlay = useOverlay();

const model = defineModel<Partial<Event>>({
  default: () => ({}),
});

const sideForm = useTemplateRef("sideForm");
const mainForm = useTemplateRef("mainForm");

// Auto-generate slug when name changes, unless user manually touched slug
const isSlugManuallyEdited = ref(props.mode === "edit");

const onNameInput = () => {
  if (!isSlugManuallyEdited.value && props.mode === "create") {
    model.value.slug = slugify(model.value.name ?? "");
  }
};

const onSlugInput = () => {
  isSlugManuallyEdited.value = true;
};

const validate = async () => {
  if (!sideForm.value || !mainForm.value) return false;

  const sideResult = await sideForm.value.validate({ silent: true });
  const mainResult = await mainForm.value.validate({ silent: true });
  return sideResult && mainResult;
};

defineExpose({
  validate,
});

const mainSchema = z.object({
  slug: z
    .string("ID podujatia je povinný údaj")
    .min(3, "ID podujatia musí mať aspoň 3 znaky")
    .regex(
      /^[a-z0-9-]+$/,
      "ID podujatia môže obsahovať iba malé písmená, čísla a pomlčky",
    ),
  name: z
    .string("Názov podujatia je povinný údaj")
    .min(1, "Názov podujatia je povinný údaj"),
  address: z
    .string("Adresa podujatia je povinný údaj")
    .min(1, "Adresa podujatia je povinný údaj"),
  motion: z
    .object({
      text: z.string().min(1, "Text tézy je povinný údaj"),
      href: z.url("URL tézy musí byť URL").nullish(),
    })
    .optional()
    .nullable(),
});

const sideSchema = z.object({
  thumbnailUrl: z.url("Náhľadová snímka podujatia musí byť URL").nullish(),
  type: z
    .enum(EVENT_TYPES, {
      message: "Neplatný typ podujatia",
    })
    .optional(),
  place: z
    .string("Miesto konania podujatia je povinný údaj")
    .min(1, "Miesto konania podujatia je povinný údaj"),
  targetRegion: z.enum(REGIONS).nullish(),
  targetLeague: z.enum(LEAGUES).nullish(),
});

// Computed properties for safe binding to nested motion object
const motionText = computed({
  get: () => model.value.motion?.text ?? "",
  set: (val: string) => {
    model.value.motion = {
      text: val,
      href: model.value.motion?.href ?? undefined,
    };
  },
});

const motionHref = computed({
  get: () => model.value.motion?.href ?? "",
  set: (val: string) => {
    model.value.motion = {
      text: model.value.motion?.text ?? "",
      href: val || undefined,
    };
  },
});

const uploadThumbnail = async (file: File | null | undefined) => {
  if (!file) return;

  const modal = overlay.create(LazyModalThumbnailCropper);
  const instance = modal.open({
    file,
  });

  const result = await instance.result;
  if (!result) return;

  try {
    const data = await $fetch("/api/events/thumbnails/upload", {
      method: "POST",
    });

    if (!data?.uploadUrl) return;

    await fetch(data.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": result.type,
      },
      body: result,
    });

    model.value.thumbnailUrl = data.publicUrl;
  } catch {
    toast.add({
      title: "Nastala chyba",
      description: "Nepodarilo sa nahrať náhľadovú snímku",
      color: "error",
    });
  }
};

const removeThumbnail = () => {
  model.value.thumbnailUrl = undefined;
};
</script>

<template>
  <div class="flex flex-col gap-6 xl:flex-row w-full">
    <div class="flex flex-col gap-5 w-full flex-1 min-w-0">
      <UForm
        ref="mainForm"
        :schema="mainSchema"
        :state="model"
        class="flex flex-col gap-4">
        <div class="flex flex-col gap-4 md:flex-row">
          <UFormField
            label="Názov podujatia"
            name="name"
            required
            class="flex-1">
            <UInput
              v-model="model.name"
              placeholder="Zadajte názov podujatia"
              class="w-full"
              @input="onNameInput" />
          </UFormField>

          <UFormField
            label="ID podujatia"
            name="slug"
            required
            :hint="mode === 'edit' ? 'Nemenné' : 'Unikátna adresa'"
            class="w-full md:w-64">
            <UInput
              v-model="model.slug"
              :disabled="mode === 'edit'"
              placeholder="napr. dnju-open-2026"
              class="w-full font-mono text-sm"
              @input="onSlugInput" />
          </UFormField>
        </div>

        <UFormField label="Adresa podujatia" name="address" required>
          <UInput
            v-model="model.address"
            placeholder="Zadajte presnú adresu (napr. Národná 12, Banská Bystrica)"
            class="w-full" />
        </UFormField>

        <template v-if="model.type === 'tournament'">
          <USeparator class="my-2" label="Pripravovaná téza" />

          <UFormField label="Text tézy" name="motion.text">
            <UTextarea
              v-model="motionText"
              placeholder="Zadajte znenie debatnej tézy..."
              :rows="3"
              class="w-full" />
          </UFormField>

          <UFormField label="Odkaz na podklady k téze" name="motion.href">
            <UInput
              v-model="motionHref"
              placeholder="https://example.com/podklady-k-teze"
              class="w-full" />
          </UFormField>
        </template>
      </UForm>

      <USeparator class="my-2" label="Popis podujatia" />

      <EventDescriptionEditor v-model="model.description" />

      <USeparator class="flex-1" label="Časový harmonogram" />

      <EventScheduleEditor v-model="model.schedule" />
    </div>

    <UForm
      ref="sideForm"
      :schema="sideSchema"
      :state="model"
      class="flex flex-col gap-4 border-default xl:border-l xl:pl-6 xl:w-96 w-full shrink-0">
      <UFormField label="Náhľadová snímka podujatia">
        <div v-if="model.thumbnailUrl" class="space-y-2">
          <UCard
            class="aspect-21/9 overflow-hidden relative group"
            :ui="{
              body: 'flex h-full w-full p-0 sm:p-0 items-center justify-center',
            }">
            <NuxtImg
              :src="model.thumbnailUrl"
              alt="Náhľadová snímka podujatia"
              width="645"
              class="w-full h-full object-cover" />
          </UCard>
          <div class="flex gap-2">
            <UFileUpload
              v-slot="{ open }"
              :preview="false"
              label="Zmeniť"
              accept="image/*"
              class="´flex-1 w-full"
              @update:modelValue="uploadThumbnail">
              <UButton
                color="neutral"
                variant="subtle"
                icon="i-ph-upload"
                label="Zmeniť"
                class="w-full"
                block
                @click="() => open()" />
            </UFileUpload>
            <UButton
              color="error"
              variant="subtle"
              icon="i-ph-trash"
              label="Odstrániť"
              @click="removeThumbnail" />
          </div>
        </div>
        <UFileUpload
          v-else
          :preview="false"
          label="Potiahnite obrázok alebo kliknite sem"
          accept="image/*"
          class="w-full aspect-21/9"
          @update:modelValue="uploadThumbnail" />
      </UFormField>

      <UFormField label="Typ podujatia" name="type" required>
        <USelect
          v-model="model.type"
          placeholder="Vyberte typ podujatia"
          class="w-full"
          :items="EVENT_TYPE_OPTIONS" />
      </UFormField>

      <UFormField label="Miesto konania podujatia" name="place" required>
        <UInput
          v-model="model.place as string | undefined"
          placeholder="Zadajte miesto podujatia (napr. Košice)" />
      </UFormField>

      <template v-if="model.type === 'tournament'">
        <UFormField label="Debatný program" name="targetLeague" required>
          <USelect
            v-model="model.targetLeague as any"
            placeholder="Vyberte debatný program"
            class="w-full"
            :items="LEAGUE_OPTIONS" />
        </UFormField>

        <UFormField label="Cieľový región" name="targetRegion" required>
          <USelect
            v-model="model.targetRegion"
            placeholder="Vyberte cieľový región"
            class="w-full"
            :items="REGION_OPTIONS" />
        </UFormField>
      </template>
    </UForm>
  </div>
</template>
