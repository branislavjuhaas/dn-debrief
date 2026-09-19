<script setup lang="ts">
import type { Event } from "#shared/types/event";
import { LazyModalThumbnailCropper } from "#components";
import z from "zod";
import { leagueEnum, regionEnum } from "#server/db/schema/clubs";
import { eventTypeEnum } from "#server/db/schema/events";

const toast = useToast();
const overlay = useOverlay();

const model = defineModel<Partial<Event>>({
  default: () => ({}),
});

const sideForm = useTemplateRef("sideForm");
const mainForm = useTemplateRef("mainForm");

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
    .min(3, "ID podujatia musí mať aspoň 3 znaky"),
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
    .enum(eventTypeEnum.enumValues, {
      message: "Neplatný typ podujatia",
    })
    .optional(),
  place: z
    .string("Miesto konania podujatia je povinný údaj")
    .min(1, "Miesto konania podujatia je povinný údaj"),
  targetRegion: z.enum(regionEnum.enumValues).nullish(),
  targetLeague: z.enum(leagueEnum.enumValues).nullish(),
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

    // 2. Upload cropped image blob directly to storage bucket (R2/S3)
    await fetch(data.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": result.type,
      },
      body: result,
    });

    model.value.thumbnailUrl = data.publicUrl;
  } catch (error) {
    toast.add({
      title: "Nastala chyba",
      description: "Nepodarilo sa nahrát náhľadovú snímku",
      color: "error",
    });
  }
};
</script>

<template>
  <div class="flex flex-col gap-4 xl:flex-row w-full">
    <div class="flex flex-col gap-4 w-full">
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
              class="w-full" />
          </UFormField>

          <UFormField
            label="ID podujatia"
            name="slug"
            required
            class="w-full md:w-64">
            <UInput
              v-model="model.slug"
              placeholder="napr. sc271"
              class="w-full" />
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

      <USeparator class="my-2" label="Časový harmonogram" />

      <EventScheduleEditor v-model="model.schedule" />
    </div>

    <UForm
      ref="sideForm"
      :schema="sideSchema"
      :state="model"
      class="flex flex-col gap-4 border-l border-default pl-4 min-w-104">
      <UFormField label="Náhľadová snímka podujatia" class="row-span-3">
        <UCard
          v-if="model.thumbnailUrl"
          class="aspect-21/9 flex"
          :ui="{
            body: 'flex h-full w-full p-0 sm:p-0 items-center justify-center',
          }">
          <NuxtImg
            :src="model.thumbnailUrl"
            alt="Náhľadová snímka podujatia"
            width="645" />
        </UCard>
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
          :items="[
            {
              label: 'Turnaj',
              value: 'tournament',
            },
            {
              label: 'Seminár',
              value: 'workshop',
            },
            {
              label: 'Iný typ podujatia',
              value: 'other',
            },
          ]" />
      </UFormField>

      <UFormField label="Miesto konania podujatia" name="place" required>
        <UInput
          v-model="model.place as string | undefined"
          placeholder="Zadajte miesto podujatia (napr. Košice)" />
      </UFormField>

      <template v-if="model.type === 'tournament'">
        <UFormField label="Debatný program" name="targetLeague" required>
          <USelect
            v-model="model.targetLeague as string | undefined"
            placeholder="Vyberte debatný program"
            class="w-full"
            :items="[
              {
                label: 'Základoškolský debatný program',
                value: 'junior',
              },
              {
                label: 'Stredoškolský debatný program',
                value: 'senior',
              },
              {
                label: 'Vysokoškolský debatný program',
                value: 'university',
              },
            ]" />
        </UFormField>

        <UFormField label="Cieľový región" name="targetRegion" required>
          <USelect
            v-model="model.targetRegion"
            placeholder="Vyberte cieľový región"
            class="w-full"
            :items="[
              {
                label: 'Západoslovenský región',
                value: 'western',
              },
              {
                label: 'Stredoslovenský región',
                value: 'central',
              },
              {
                label: 'Východoslovenský región',
                value: 'eastern',
              },
              {
                label: 'Celoslovenské podujatie',
                value: null,
              },
            ]" />
        </UFormField>
      </template>
    </UForm>
  </div>
</template>
