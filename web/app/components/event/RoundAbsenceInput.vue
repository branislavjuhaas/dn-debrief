<script setup lang="ts">
import type { RoundAbsenceAnswer } from "#shared/types/event";
import {
  ALL_ROUNDS_LABEL,
  parseRoundAbsenceAnswer,
  type RoundAbsenceQuestion,
} from "#shared/utils/events";

const props = defineProps<{ rounds: RoundAbsenceQuestion["rounds"] }>();
const model = defineModel<unknown>();
const emit = defineEmits<{ change: [] }>();

const answer = computed(() => parseRoundAbsenceAnswer(model.value));
// Absences in rounds deleted from the question are neither shown nor kept on change.
const absent = computed(
  () =>
    answer.value?.absent.filter((id) =>
      props.rounds.some((round) => round.id === id),
    ) ?? [],
);
const attendsAll = computed(() => answer.value?.absent.length === 0);
const items = computed(() =>
  props.rounds.map((round) => ({ label: round.label, value: round.id })),
);

// Any change records the rounds shown now as the scope of the answer.
function set(absent: string[] | null) {
  model.value = absent
    ? ({
        absent,
        rounds: props.rounds.map((round) => round.id),
      } satisfies RoundAbsenceAnswer)
    : null;
  emit("change");
}

function selectRounds(value: unknown[]) {
  const ids = value
    .map(String)
    .filter((id) => props.rounds.some((round) => round.id === id));
  // No selected round is "unanswered", never "attends all".
  set(ids.length ? ids : null);
}
</script>

<template>
  <div class="space-y-2 pt-1">
    <UCheckboxGroup
      :model-value="absent"
      :items="items"
      color="primary"
      class="space-y-2"
      variant="card"
      @update:model-value="selectRounds" />
    <UCheckbox
      :model-value="attendsAll"
      :label="ALL_ROUNDS_LABEL"
      color="primary"
      variant="card"
      @update:model-value="(value) => set(value ? [] : null)" />
  </div>
</template>
