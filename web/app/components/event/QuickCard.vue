<script setup lang="ts">
import type { Event } from "#shared/types/event";

const props = defineProps<{ event: Event }>();

const formatter = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDeadline = (date: Date) => formatter.format(date);
</script>

<template>
  <UCard
    :ui="{
      body: 'p-0 sm:p-0 grid lg:grid-cols-[auto_1fr] min-h-41 items-center',
    }">
    <div
      class="aspect-7/3 overflow-hidden h-full max-h-42! mb-auto rounded-br-lg">
      <NuxtImg
        :src="
          props.event.thumbnailUrl ||
          `/assets/events/thumbnails/${(props.event.id % 5) + 1}.jpg`
        "
        alt="Event thumbnail"
        class="object-cover aspect-7/3 h-full transition-transform duration-300" />
    </div>
    <div class="flex flex-col gap-2 px-5 py-4 w-full">
      <ProfileDetail
        icon="i-ph-map-trifold-fill"
        label="Kde"
        :value="event.address" />
      <ProfileDetail
        icon="i-ph-watch-fill"
        label="Kedy"
        :value="formatRange(new Date(event.beginning), new Date(event.end))" />
      <span class="flex flex-row gap-2">
        <ProfileDetail
          icon="i-ph-quotes-fill"
          label="Téza"
          :value="event.motion?.text" />
        <NuxtLink
          v-if="event.motion?.href"
          :to="event.motion?.href"
          class="leading-none">
          <UBadge
            label="Rozbor tézy"
            trailing-icon="i-ph-arrow-square-up-right"
            color="info"
            variant="subtle"
            size="sm" />
        </NuxtLink>
      </span>
      <template
        v-if="
          event.registrationConfig.cost && event.registrationConfig.softDeadline
        ">
        <ProfileDetail
          icon="i-ph-coins-fill"
          label="Koľko"
          :value="`${event.registrationConfig.cost ?? 0}€`" />
        <ProfileDetail
          icon="i-ph-warning-octagon-fill"
          label="Deadline"
          :value="
            formatDeadline(
              new Date(
                event.registrationConfig.deadline ??
                  event.registrationConfig.softDeadline ??
                  event.beginning,
              ),
            )
          " />
      </template>

      <table v-else class="table-auto text-sm">
        <tr>
          <th>
            <span class="space-x-2 text-sm items-center flex text-pretty">
              <UIcon name="i-ph-users-fill" class="size-5 flex-none" />
              <span>Účastnícke role</span>
            </span>
          </th>
          <th class="text-left text-sm">Cena</th>
          <th class="text-left text-sm">Deadline</th>
        </tr>
        <tr v-for="role in event.registrationConfig.roles">
          <td class="pt-2.5">{{ role.name }}</td>
          <td class="pt-2.5">{{ role.cost ?? 0 }}€</td>
          <td class="pt-2.5">
            {{
              role.hardDeadline
                ? formatDeadline(
                    new Date(
                      role.hardDeadline ??
                        event.registrationConfig.softDeadline,
                    ),
                  )
                : "—"
            }}
          </td>
        </tr>
      </table>
    </div>
  </UCard>
</template>
