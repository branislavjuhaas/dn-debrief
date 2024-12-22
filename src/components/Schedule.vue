<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  beginning: String,
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

// Create local copy of schedule
const schedule = ref(JSON.parse(JSON.stringify(props.modelValue)));

// Watch for external changes
watch(
  () => props.modelValue,
  (newVal) => {
    schedule.value = JSON.parse(JSON.stringify(newVal));
  },
  { deep: true },
);

// Helper function to emit changes
const emitChange = () => {
  emit("update:modelValue", JSON.parse(JSON.stringify(schedule.value)));
};

const start = computed(() =>
  props.beginning ? new Date(props.beginning) : new Date(),
);

const weekDays = [
  "Nedeľa",
  "Pondelok",
  "Utorok",
  "Streda",
  "Štvrtok",
  "Piatok",
  "Sobota",
];

const getFormattedDate = (beginning, index) => {
  const date = new Date(beginning);
  date.setDate(date.getDate() + index);
  const dayOfWeek = weekDays[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${dayOfWeek} (${day}.${month}.)`;
};

/**
 * Calculates the start time for a given day and point index.
 * @param {Object} day - The day object containing schedule information.
 * @param {number} pointIndex - The index of the point within the day's points.
 * @returns {string} The formatted start time.
 */
const getStartTime = (day, pointIndex) => {
  const startOffset =
    day.beginning +
    day.points.slice(0, pointIndex).reduce((acc, p) => acc + p.duration, 0);
  return minutesToTime(startOffset);
};

/**
 * Calculates the end time for a given day and point index.
 * @param {Object} day - The day object containing schedule information.
 * @param {number} pointIndex - The index of the point within the day's points.
 * @returns {string} The formatted end time.
 */
const getEndTime = (day, pointIndex) => {
  const startOffset =
    day.beginning +
    day.points.slice(0, pointIndex).reduce((acc, p) => acc + p.duration, 0);
  return minutesToTime(startOffset + day.points[pointIndex].duration);
};

/**
 * Gets the end time in minutes for a given day and point index.
 * @param {Object} day - The day object containing schedule information.
 * @param {number} pointIndex - The index of the point within the day's points.
 * @returns {number} The end time in minutes.
 */
const getEndTimeInMinutes = (day, pointIndex) => {
  const startOffset =
    day.beginning +
    day.points.slice(0, pointIndex).reduce((acc, p) => acc + p.duration, 0);
  return startOffset + day.points[pointIndex].duration;
};

/**
 * Converts minutes to a time string in "HH:MM" format.
 * @param {number} minutes - The total minutes to convert.
 * @returns {string} The formatted time string.
 */
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins < 10 ? "0" : ""}${mins}`;
};

/**
 * Adds a new day to the schedule.
 */
const addDay = () => {
  schedule.value.days.push({
    beginning: 540,
    points: [{ name: "", duration: 30 }],
  });
  emitChange();
};

/**
 * Parses a time string in "HH:MM" format to minutes.
 * @param {string} timeString - The time string to parse.
 * @returns {number} The time in minutes.
 */
const parseTimeString = (timeString) => {
  const parts = timeString.split(":").map((p) => p.trim());
  if (parts.length !== 2) throw new Error("Invalid time format");
  const [hh, mm] = parts.map(Number);
  if (isNaN(hh) || isNaN(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) {
    throw new Error("Invalid time range");
  }
  return hh * 60 + mm;
};

/**
 * Validates that the edited time does not exceed midnight.
 * @param {Object} day - The day object containing schedule information.
 * @param {number} editedIndex - The index of the edited point.
 * @returns {boolean} True if valid, false otherwise.
 */
const validateDayTimes = (day, editedIndex) => {
  const minutesInDay = 24 * 60;
  let currentOffset = day.beginning;

  for (let i = 0; i <= editedIndex; i++) {
    const point = day.points[i];
    const endTime = currentOffset + point.duration;
    if (endTime > minutesInDay && i === editedIndex) return false;
    currentOffset = endTime;
  }
  return true;
};

/**
 * Checks if a new point can be added without exceeding the day's limit.
 * @param {Object} day - The day object containing schedule information.
 * @returns {boolean} True if a point can be added, false otherwise.
 */
const canAddPoint = (day) => {
  const lastEndTime =
    day.beginning + day.points.reduce((acc, p) => acc + p.duration, 0);
  return lastEndTime <= 23 * 60 + 30;
};

/**
 * Adds a new point to a specific day.
 * @param {Object} day - The day object to add a point to.
 */
const addPoint = (day) => {
  if (canAddPoint(day)) {
    day.points.push({ name: "", duration: 30 });
    emitChange();
  }
};

/**
 * Removes a point from a specific day at the given index.
 * @param {Object} day - The day object to remove a point from.
 * @param {number} index - The index of the point to remove.
 */
const removePoint = (day, index) => {
  if (day.points.length > 1) {
    day.points.splice(index, 1);
    emitChange();
  }
};

/**
 * Removes a day from the schedule at the given index.
 * @param {number} index - The index of the day to remove.
 */
const removeDay = (index) => {
  schedule.value.days.splice(index, 1);
  emitChange();
};

/**
 * Checks if editing a point exceeds midnight.
 * @param {Object} day - The day object containing schedule information.
 * @returns {boolean} True if it exceeds midnight, false otherwise.
 */
const editDoesExceedMidnight = (day) => {
  const minutesInDay = 24 * 60;
  const endOfLastPoint = getEndTimeInMinutes(day, day.points.length - 1);
  console.log(endOfLastPoint, minutesInDay);
  return endOfLastPoint > minutesInDay;
};

/**
 * Handles changes to the end time input for a point.
 * @param {Object} day - The day object containing schedule information.
 * @param {number} index - The index of the point being edited.
 * @param {string} endTimeStr - The new end time string.
 */
const onTimeInputChange = (day, index, endTimeStr) => {
  const point = day.points[index];
  point.isInvalid = false;

  if (!endTimeStr) {
    point.duration = 0;
    return;
  }

  console.log(day, index, endTimeStr, "doing actual checks");

  try {
    const startMinutes =
      day.beginning +
      day.points.slice(0, index).reduce((acc, p) => acc + p.duration, 0);
    const endMinutes = parseTimeString(endTimeStr);
    const duration = endMinutes - startMinutes;

    if (duration <= 0) {
      point.isInvalid = true;
    }

    const originalDuration = point.duration;
    point.duration = duration;

    if (!validateDayTimes(day, index)) {
      point.duration = originalDuration;
      point.isInvalid = true;
    }

    if (editDoesExceedMidnight(day)) {
      point.duration = originalDuration;
      point.isInvalid = true;
    }

    emitChange(); // Emit only if validation passes
  } catch {
    point.isInvalid = true;
  }
};

/**
 * Handles changes to the beginning time of a day.
 * @param {Object} day - The day object being edited.
 * @param {string} timeStr - The new beginning time string.
 */
const onBeginningTimeChange = (day, timeStr) => {
  try {
    const originalBeginning = day.beginning;
    day.beginning = parseTimeString(timeStr);

    if (!validateDayTimes(day, 0)) {
      day.beginning = originalBeginning;
      day.points[0].isInvalid = true;
    } else {
      emitChange(); // Emit only if validation passes
    }
  } catch {
    day.points[0].isInvalid = true;
  }
};

// Add these new refs for drag and drop
const draggedItem = ref(null);
const draggedOverItem = ref(null);
const isDragging = ref(false);

/**
 * Starts the drag operation for a point.
 * @param {Object} day - The day containing the point.
 * @param {Object} point - The point being dragged.
 * @param {number} index - The index of the point.
 */
const startDrag = (day, point, index) => {
  draggedItem.value = { day, point, index };
  isDragging.value = true;
};

/**
 * Handles the drag event.
 * @param {Event} e - The drag event.
 */
const onDrag = (e) => {
  e.preventDefault();
};

/**
 * Handles the drag enter event.
 * @param {Object} day - The day containing the point.
 * @param {Object} point - The point being dragged over.
 * @param {number} index - The index of the point being dragged over.
 */
const onDragEnter = (day, point, index) => {
  draggedOverItem.value = { day, point, index };
};

/**
 * Ends the drag operation and reorders points if applicable.
 * @param {Object} day - The day containing the points.
 */
const endDrag = (day) => {
  isDragging.value = false;
  if (!draggedItem.value || !draggedOverItem.value) return;

  // Only allow reordering within the same day
  if (draggedItem.value.day === draggedOverItem.value.day) {
    const items = [...day.points];
    const draggedItemIndex = draggedItem.value.index;
    const draggedOverItemIndex = draggedOverItem.value.index;

    // Remove dragged item
    const [removedItem] = items.splice(draggedItemIndex, 1);
    // Insert at new position
    items.splice(draggedOverItemIndex, 0, removedItem);

    day.points = items;
    emitChange();
  }

  draggedItem.value = null;
  draggedOverItem.value = null;
};
</script>

<template>
  <div
    class="flex flex-col px-5 py-3 min-h-60 w-full border-2 border-black rounded-[1.25rem] gap-4">
    <h2 class="text-black font-bold">Harmonogram podujatia</h2>
    <div class="flex flex-row overflow-x-auto scrollbar-hidden gap-4">
      <div
        v-for="(day, index) in schedule.days"
        :key="index"
        class="flex flex-col w-96">
        <div class="grid grid-cols-[1fr_auto] h-5 items-start mb-4">
          <p class="font-bold text-black h-min">
            {{ getFormattedDate(start, index) }}
          </p>
          <button
            @click="removeDay(index)"
            class="p-0 m-0"
            v-if="schedule.days.length > 1">
            <img src="./../assets/icons/cross.svg" alt="x" class="w-5" />
          </button>
        </div>
        <div class="flex flex-col gap-2">
          <div
            v-for="(point, pointIndex) in day.points"
            :key="pointIndex"
            class="grid grid-cols-[auto_1fr_auto] gap-4 text-black p-2 px-4 rounded-[0.75rem] cursor-move"
            :class="[
              point.isInvalid ? 'bg-grey' : 'bg-blue',
              isDragging && draggedOverItem?.index === pointIndex
                ? 'border-2 border-black'
                : '',
              isDragging && draggedItem?.index === pointIndex
                ? 'opacity-50'
                : '',
              isDragging ? 'cursor-grabbing' : 'cursor-grab',
            ]"
            draggable="true"
            @dragstart="startDrag(day, point, pointIndex)"
            @drag="onDrag"
            @dragenter="onDragEnter(day, point, pointIndex)"
            @dragend="endDrag(day)"
            @dragover.prevent>
            <div class="flex flex-row">
              <input
                type="text"
                class="bg-transparent w-12 text-center"
                :value="getStartTime(day, pointIndex)"
                :readonly="pointIndex !== 0"
                @change="
                  (e) =>
                    pointIndex === 0 &&
                    onBeginningTimeChange(day, e.target.value)
                " />
              <p>-</p>
              <input
                type="text"
                class="bg-transparent w-12 text-center"
                :value="getEndTime(day, pointIndex)"
                @change="
                  (e) => onTimeInputChange(day, pointIndex, e.target.value)
                " />
            </div>
            <input
              type="text"
              placeholder="názov bodu"
              class="bg-transparent"
              :value="point.name"
              @input="
                (e) => {
                  point.name = e.target.value;
                  emitChange();
                }
              " />
            <button
              @click="removePoint(day, pointIndex)"
              class="w-5"
              v-if="day.points.length > 1">
              <img src="./../assets/icons/cross.svg" alt="x" class="w-5" />
            </button>
          </div>
          <button
            @click="addPoint(day)"
            :disabled="!canAddPoint(day)"
            class="flex bg-red text-white p-1.5 px-4 rounded-[0.75rem] items-center justify-center hover:bg-black disabled:border-dashed disabled:border-2 disabled:border-black disabled:bg-white disabled:text-grey disabled:cursor-default">
            <span>Pridať bod</span>
          </button>
        </div>
      </div>
      <div class="w-[2px] bg-black h-full rounded-full shrink-0"></div>
      <p
        @click="addDay"
        class="flex flex-row text-black font-bold cursor-pointer h-min gap-2 text-nowrap mr-5">
        <img src="./../assets/icons/plus.svg" alt="+" class="w-5 -mt-1" />
        Pridať deň
      </p>
    </div>
  </div>
</template>

<style scoped>
input:focus {
  outline: none;
}

/* Add these new cursor styles */
[draggable="true"] {
  user-select: none;
  -webkit-user-drag: element;
  cursor: grab;
}

[draggable="true"]:active {
  cursor: grabbing;
}
</style>
