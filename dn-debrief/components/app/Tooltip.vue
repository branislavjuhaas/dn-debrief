<template>
  <TooltipProvider>
    <TooltipRoot>
      <TooltipTrigger class="flex outline-none" :class="props.class">
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          class="text-black data-[side=bottom]:animate-slide-up data-[side=right]:animate-slide-left data-[side=left]:animate-slide-right data-[side=top]:animate-slide-down w-fit bg-white px-3 pb-1 pt-1.5 data-[state=open]:transition-all border-2 border-black shadow-dialog z-10 data-[side=top]:rounded-bl-lg data-[side=bottom]:rounded-tl-lg data-[side=left]:rounded-tr-lg data-[side=right]:rounded-tl-lg rounded-2xl translate-x-5"
          :side-offset="5"
          :class="props.contentClass"
          as="div"
          :collision-padding="{ bottom: 60, top: 60 }"
          align="start">
          <div class="flex flex-col gap-2">
            {{ props.content }}
          </div>
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<script setup lang="ts">
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "reka-ui";

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    default: "",
  },
  contentClass: {
    type: String,
    default: "",
  },
});
</script>
