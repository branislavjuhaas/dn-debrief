<script setup lang="ts">
import type { EditorCustomHandlers, EditorToolbarItem } from "@nuxt/ui";
import type { Editor, JSONContent } from "@tiptap/vue-3";
import { TextAlign } from "@tiptap/extension-text-align";
import { ImageUpload } from "./DescriptionEditorImageUploadExtension";
import EditorLinkPopover from "./DescriptionEditorLinkPopover.vue";

const model = defineModel<string>();

const customHandlers = {
  imageUpload: {
    canExecute: (editor: Editor) =>
      editor.can().insertContent({ type: "imageUpload" }),
    execute: (editor: Editor) =>
      editor.chain().focus().insertContent({ type: "imageUpload" }),
    isActive: (editor: Editor) => editor.isActive("imageUpload"),
    isDisabled: undefined,
  },
} satisfies EditorCustomHandlers;

const fixedToolbarItems = [
  [
    {
      kind: "undo",
      icon: "i-ph-arrow-u-up-left",
      tooltip: { text: "Krok späť" },
    },
    {
      kind: "redo",
      icon: "i-ph-arrow-u-up-right",
      tooltip: { text: "Krok dopredu" },
    },
  ],
  [
    {
      icon: "i-ph-text-h",
      tooltip: { text: "Nadpisy" },
      content: {
        align: "start",
      },
      items: [
        {
          kind: "heading",
          level: 2,
          icon: "i-ph-text-h-two",
          label: "Nadpis 2",
        },
        {
          kind: "heading",
          level: 3,
          icon: "i-ph-text-h-three",
          label: "Nadpis 3",
        },
        {
          kind: "heading",
          level: 4,
          icon: "i-ph-text-h-four",
          label: "Nadpis 4",
        },
      ],
    },
    {
      icon: "i-ph-list-bullets",
      tooltip: { text: "Zoznamy" },
      content: {
        align: "start",
      },
      items: [
        {
          kind: "bulletList",
          icon: "i-ph-list-bullets",
          label: "Bodový zoznam",
        },
        {
          kind: "orderedList",
          icon: "i-ph-list-numbers",
          label: "Číslovaný zoznam",
        },
      ],
    },
    {
      kind: "blockquote",
      icon: "i-ph-quotes",
      tooltip: { text: "Citácia" },
    },
  ],
  [
    {
      kind: "mark",
      mark: "bold",
      icon: "i-ph-text-b",
      tooltip: { text: "Tučné" },
    },
    {
      kind: "mark",
      mark: "italic",
      icon: "i-ph-text-italic",
      tooltip: { text: "Kurzíva" },
    },
    {
      kind: "mark",
      mark: "underline",
      icon: "i-ph-text-underline",
      tooltip: { text: "Podčiarknuté" },
    },
    {
      kind: "mark",
      mark: "strike",
      icon: "i-ph-text-strikethrough",
      tooltip: { text: "Prečiarknuté" },
    },
    {
      kind: "mark",
      mark: "code",
      icon: "i-ph-code",
      tooltip: { text: "Kód" },
    },
  ],
  [
    {
      slot: "link" as const,
      icon: "i-ph-link",
    },
    {
      kind: "imageUpload",
      icon: "i-ph-image",
      tooltip: { text: "Obrázok" },
    },
  ],
  [
    {
      icon: "i-ph-text-align-justify",
      tooltip: { text: "Zarovnanie" },
      content: {
        align: "end",
      },
      items: [
        {
          kind: "textAlign",
          align: "left",
          icon: "i-ph-text-align-left",
          label: "Vľavo",
        },
        {
          kind: "textAlign",
          align: "center",
          icon: "i-ph-text-align-center",
          label: "Na stred",
        },
        {
          kind: "textAlign",
          align: "right",
          icon: "i-ph-text-align-right",
          label: "Vpravo",
        },
        {
          kind: "textAlign",
          align: "justify",
          icon: "i-ph-text-align-justify",
          label: "Do bloku",
        },
      ],
    },
  ],
] satisfies EditorToolbarItem<typeof customHandlers>[][];

const imageToolbarItems = (editor: Editor): EditorToolbarItem[][] => {
  const node = editor.state.doc.nodeAt(editor.state.selection.from);

  return [
    [
      {
        icon: "i-ph-download-simple",
        to: node?.attrs?.src,
        download: true,
        tooltip: { text: "Stiahnuť" },
      },
      {
        icon: "i-ph-arrows-clockwise",
        tooltip: { text: "Nahradiť" },
        onClick: () => {
          const { state } = editor;
          const { selection } = state;

          const pos = selection.from;
          const node = state.doc.nodeAt(pos);

          if (node && node.type.name === "image") {
            editor
              .chain()
              .focus()
              .deleteRange({ from: pos, to: pos + node.nodeSize })
              .insertContentAt(pos, { type: "imageUpload" })
              .run();
          }
        },
      },
    ],
    [
      {
        icon: "i-ph-trash",
        tooltip: { text: "Vymazať" },
        onClick: () => {
          const { state } = editor;
          const { selection } = state;

          const pos = selection.from;
          const node = state.doc.nodeAt(pos);

          if (node && node.type.name === "image") {
            editor
              .chain()
              .focus()
              .deleteRange({ from: pos, to: pos + node.nodeSize })
              .run();
          }
        },
      },
    ],
  ];
};
</script>

<template>
  <UEditor
    ref="editorRef"
    v-slot="{ editor }"
    v-model="model"
    content-type="markdown"
    :starter-kit="{
      heading: {
        levels: [2, 3, 4, 5, 6],
      },
    }"
    :extensions="[
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ImageUpload,
    ]"
    :handlers="customHandlers"
    placeholder="Začnite písať popis podujatia"
    :ui="{ base: 'py-4' }"
    class="w-full">
    <UEditorToolbar
      :editor="editor"
      :items="fixedToolbarItems"
      class="border-b border-muted sticky top-0 inset-x-0 py-2 z-50 bg-default overflow-x-auto">
      <template #link>
        <EditorLinkPopover :editor="editor" auto-open />
      </template>
    </UEditorToolbar>

    <UEditorToolbar
      :editor="editor"
      :items="imageToolbarItems(editor)"
      layout="bubble"
      :should-show="
        ({ editor, view }) => {
          return editor.isActive('image') && view.hasFocus();
        }
      " />
  </UEditor>
</template>
