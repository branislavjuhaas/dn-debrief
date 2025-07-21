<template>
  <div :class="root({ layout: props.layout || 'default' })">
    <ClientOnly>
      <div :class="toolbar({ layout: props.layout || 'default' })">
        <div
          v-if="editor"
          class="overflow-hidden gap-0.5 flex flex-row items-center">
          <button
            :disabled="!editor.can().chain().focus().undo().run()"
            @click="editor.chain().focus().undo().run()">
            <Icon name="ph:arrow-u-up-left" />
          </button>
          <button
            :disabled="!editor.can().chain().focus().redo().run()"
            @click="editor.chain().focus().redo().run()">
            <Icon name="ph:arrow-u-up-right" />
          </button>
          <div class="separator" data-orientation="vertical" role="none" />
          <DropdownMenuRoot>
            <DropdownMenuTrigger class="flex items-center">
              <Icon
                :name="iconForHeading(editor.getAttributes('heading').level)"
                class="cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent
                class="flex flex-row border-2 border-black bg-white text-black rounded-2xl p-2 shadow-dialog will-change-[opacity,transform] gap-1 animate-slide-up z-50"
                :side-offset="5"
                align="start">
                <DropdownMenuItem
                  class="heading"
                  :class="{ 'is-active': editor.isActive('paragraph') }"
                  @click="editor.chain().focus().setParagraph().run()">
                  <Icon name="ph:text-t" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  class="heading"
                  :class="{
                    'is-active': editor.isActive('heading', { level: 3 }),
                  }"
                  @click="
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  ">
                  <Icon name="ph:text-h-one" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  class="heading"
                  :class="{
                    'is-active': editor.isActive('heading', { level: 4 }),
                  }"
                  @click="
                    editor.chain().focus().toggleHeading({ level: 4 }).run()
                  ">
                  <Icon name="ph:text-h-two" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  class="heading"
                  :class="{
                    'is-active': editor.isActive('heading', { level: 5 }),
                  }"
                  @click="
                    editor.chain().focus().toggleHeading({ level: 5 }).run()
                  ">
                  <Icon name="ph:text-h-three" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenuRoot>
          <div class="separator" data-orientation="vertical" role="none" />
          <button
            :disabled="!editor.can().chain().focus().toggleBold().run()"
            :class="{ 'is-active': editor.isActive('bold') }"
            @click="editor.chain().focus().toggleBold().run()">
            <Icon name="ph:text-b" />
          </button>
          <button
            :disabled="!editor.can().chain().focus().toggleItalic().run()"
            :class="{ 'is-active': editor.isActive('italic') }"
            @click="editor.chain().focus().toggleItalic().run()">
            <Icon name="ph:text-italic" />
          </button>
          <button
            :disabled="!editor.can().chain().focus().toggleStrike().run()"
            :class="{ 'is-active': editor.isActive('strike') }"
            @click="editor.chain().focus().toggleStrike().run()">
            <Icon name="ph:text-strikethrough" />
          </button>
          <div class="separator" data-orientation="vertical" role="none" />
          <button
            :class="{ 'is-active': editor.isActive('bulletList') }"
            @click="editor.chain().focus().toggleBulletList().run()">
            <Icon name="ph:list-bullets" />
          </button>
          <button
            :class="{ 'is-active': editor.isActive('orderedList') }"
            @click="editor.chain().focus().toggleOrderedList().run()">
            <Icon name="ph:list-numbers" />
          </button>
          <button
            :class="{ 'is-active': editor.isActive('blockquote') }"
            @click="editor.chain().focus().toggleBlockquote().run()">
            <Icon name="ph:quotes" />
          </button>
          <!-- Link that converts selection to link if any text is selected -->
          <div class="separator" data-orientation="vertical" role="none" />
          <button
            :class="{ 'is-active': editor.isActive('link') }"
            @click="
              editor.isActive('link')
                ? editor.chain().focus().unsetLink().run()
                : editor
                    .chain()
                    .focus()
                    .setLink({
                      href: editor.state.doc.textBetween(
                        editor.state.selection.from,
                        editor.state.selection.to
                      ),
                    })
                    .run()
            ">
            <Icon name="ph:link" />
          </button>
        </div>
        <slot />
      </div>
      <EditorContent :editor="editor" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { tv } from "tailwind-variants";

const props = defineProps<{
  layout?: "default" | "minimal";
  content?: string;
}>();

const root = tv({
  base: "flex flex-col w-full h-full overflow-hidden",
  variants: {
    layout: {
      default: "bg-white rounded-2xl border-2 border-black text-black",
      minimal: "bg-transparent",
    },
  },
});

const toolbar = tv({
  base: "flex flex-row w-full p-2 px-3 items-center justify-between border-black gap-4",
  variants: {
    layout: {
      default: "bg-transparent border-b-2",
      minimal: "bg-white text-black border-2 rounded-2xl",
    },
  },
});

const getContent = (as: "html" | "text" = "html") => {
  return as === "html" ? editor.value?.getHTML() : editor.value?.getText();
};

defineExpose({
  getContent,
});

const editor = ref<Editor | null>(null);

onMounted(() => {
  editor.value = new Editor({
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    content: props.content || "<p></p>",
    extensions: [StarterKit, Link],
  });
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});

const iconForHeading = (level: number) => {
  switch (level) {
    case 3:
      return "ph:text-h-one";
    case 4:
      return "ph:text-h-two";
    case 5:
      return "ph:text-h-three";
    default:
      return "ph:text-t";
  }
};
</script>

<style scoped>
@reference "./../../assets/css/main.css";

.is-active {
  @apply bg-gray-300;
}

.separator {
  @apply w-[1px]! mx-2 bg-black h-5 shrink-0;
}

button {
  @apply cursor-pointer p-1.5 rounded-md;
}

button:disabled {
  @apply opacity-50 cursor-not-allowed hover:bg-transparent;
}

button:hover {
  @apply bg-gray-200;
}

.heading {
  @apply cursor-pointer p-1.5 rounded-sm hover:bg-gray-200;
}

:deep(.tiptap) {
  @apply p-4 rounded-b-2xl;
}

:deep(.tiptap p) {
  @apply text-base;
}
</style>
