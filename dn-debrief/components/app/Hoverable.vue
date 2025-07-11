<template>
  <HoverCardRoot v-model:open="hoverState">
    <HoverCardTrigger class="flex outline-none w-fit h-fit">
      <slot />
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent
        class="data-[side=bottom]:animate-slide-up data-[side=right]:animate-slide-left data-[side=left]:animate-slide-right data-[side=top]:animate-slide-down w-fit bg-white px-5 py-3 data-[state=open]:transition-all border-2 border-black shadow-dialog z-10 data-[side=top]:rounded-bl-lg data-[side=bottom]:rounded-tl-lg data-[side=left]:rounded-tr-lg data-[side=right]:rounded-tl-lg rounded-2xl translate-x-1/2"
        :side-offset="5"
        :collision-padding="{ bottom: 60, top: 60 }"
        align="center">
        <div class="flex flex-col gap-2">
          <slot name="content" />
        </div>
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<script setup lang="ts">
import {
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
} from "reka-ui";
import { ref } from "vue";

const hoverState = ref(false);
</script>
