<template>
  <DatePickerRoot
    locale="sk"
    :is-date-unavailable="(date) => {
      if (!date) return false;
      const dateToString = (d: any) => {
        if (d instanceof Date) return d.toISOString().slice(0, 10);
        if (typeof d === 'string') return new Date(d).toISOString().slice(0, 10);
        if (typeof d?.toString === 'function') return d.toString();
        return '';
      };
      return !!props.unavailable?.some(
        (unavailableDate) =>
          dateToString(unavailableDate) === dateToString(date)
      );
    }">
    <DatePickerField
      v-slot="{ segments }"
      :class="calendar({ size: props.size, disabled: props.disabled })">
      <div class="flex items-center">
        <template v-for="item in segments" :key="item.part">
          <DatePickerInput
            v-if="item.part === 'literal'"
            :part="item.part"
            class="mt-1">
            {{ item.value }}
          </DatePickerInput>
          <DatePickerInput
            v-else
            :part="item.part"
            class="rounded p-0.5 focus:outline-none focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-gray mt-1">
            {{ item.value }}
          </DatePickerInput>
        </template>
      </div>

      <DatePickerTrigger
        class="focus:shadow-[0_0_0_2px] rounded p-1 -mr-1 focus:shadow-black">
        <Icon name="ph:calendar" class="text-base" />
      </DatePickerTrigger>
    </DatePickerField>

    <DatePickerContent
      :side-offset="!props.size || props.size === 'default' ? 9 : 5"
      :class="calendarPopup({ size: props.size })"
      align="end">
      <DatePickerCalendar v-slot="{ weekDays, grid }" class="p-4">
        <DatePickerHeader class="flex items-center justify-between">
          <DatePickerPrev
            class="inline-flex items-center cursor-pointer text-black justify-center rounded-md bg-transparent w-7 h-7 hover:bg-stone-200 active:scale-98 active:transition-all focus:shadow-[0_0_0_2px] focus:shadow-black">
            <Icon name="ph:caret-left" class="w-4 h-4" />
          </DatePickerPrev>

          <DatePickerHeading class="text-black font-medium" />
          <DatePickerNext
            class="inline-flex items-center cursor-pointer text-black justify-center rounded-md bg-transparent w-7 h-7 hover:bg-stone-200 active:scale-98 active:transition-all focus:shadow-[0_0_0_2px] focus:shadow-black">
            <Icon name="ph:caret-right" class="w-4 h-4" />
          </DatePickerNext>
        </DatePickerHeader>
        <div
          class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <DatePickerGrid
            v-for="month in grid"
            :key="month.value.toString()"
            class="w-full border-collapse select-none space-y-1">
            <DatePickerGridHead>
              <DatePickerGridRow class="mb-1 flex w-full justify-between">
                <DatePickerHeadCell
                  v-for="day in weekDays"
                  :key="day"
                  class="w-8 rounded-md text-xs text-black font-normal uppercase">
                  {{ day }}
                </DatePickerHeadCell>
              </DatePickerGridRow>
            </DatePickerGridHead>
            <DatePickerGridBody>
              <DatePickerGridRow
                v-for="(weekDates, index) in month.rows"
                :key="`weekDate-${index}`"
                class="flex w-full">
                <DatePickerCell
                  v-for="weekDate in weekDates"
                  :key="weekDate.toString()"
                  :date="weekDate">
                  <DatePickerCellTrigger
                    :day="weekDate"
                    :month="month.value"
                    class="relative flex items-center pt-1 justify-center whitespace-nowrap rounded-[9px] border border-transparent bg-transparent text-sm font-normal text-black w-8 h-8 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black hover:border-black data-[selected]:bg-black data-[selected]:font-medium data-[outside-view]:text-black/30 data-[selected]:text-white data-[unavailable]:pointer-events-none data-[unavailable]:text-black/30 data-[unavailable]:line-through before:absolute before:top-[5px] before:hidden before:rounded-full before:w-1 before:h-1 before:bg-white data-[today]:before:block data-[today]:before:bg-red data-[selected]:before:bg-white" />
                </DatePickerCell>
              </DatePickerGridRow>
            </DatePickerGridBody>
          </DatePickerGrid>
        </div>
      </DatePickerCalendar>
    </DatePickerContent>
  </DatePickerRoot>
</template>

<script setup lang="ts">
import { tv } from "tailwind-variants";

const props = defineProps<{
  modelValue?: Date | string;
  disabled?: boolean;
  unavailable?: Array<Date | string>;
  size?: "default" | "dialog";
  left?: boolean;
  right?: boolean;
  min?: Date | string;
  max?: Date | string;
}>();

const emit = defineEmits(["update:modelValue"]);

const calendar = tv({
  base: "flex flex-row w-full items-center justify-between px-5 gap-2 bg-white text-black border-2 border-black transition-colors duration-200 ease-in-out focus-within:border-red",
  variants: {
    size: {
      default: "h-11 rounded-2xl",
      dialog: "rounded-lg h-9",
    },
    left: {
      true: "rounded-l-0 border-l-0 pl-0",
    },
    right: {
      true: "rounded-r-0 border-r-0 pr-0",
    },
    disabled: {
      true: "opacity-50 cursor-not-allowed",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const calendarPopup = tv({
  base: "bg-white border-2 border-black shadow-dialog will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slide-up data-[state=open]:data-[side=bottom]:animate-slide-down -mr-[calc(1rem+2px)]",
  variants: {
    size: {
      default: "rounded-2xl",
      dialog: "rounded-lg",
    },
  },
  defaultVariants: {
    size: "default",
  },
});
</script>

<style scoped></style>
