<script setup lang="ts">
import type { EditorCustomHandlers, EditorToolbarItem } from "@nuxt/ui";
import type { Content } from "@tiptap/core";
import TextAlign from "@tiptap/extension-text-align";
import ImageUpload from "./image-upload-extension";

const model = defineModel<Content | undefined>();

const items: EditorToolbarItem<typeof customHandlers>[][] = [
  // History controls
  [
    {
      kind: "undo",
      icon: "i-ph-arrow-arc-left",
      tooltip: { text: "Undo" },
    },
    {
      kind: "redo",
      icon: "i-ph-arrow-arc-right",
      tooltip: { text: "Redo" },
    },
  ],
  // Block types
  [
    {
      icon: "i-ph-text-h",
      tooltip: { text: "Headings" },
      content: {
        align: "start",
      },
      items: [
        {
          kind: "heading",
          level: 1,
          icon: "i-ph-text-h-one",
          label: "Heading 1",
        },
        {
          kind: "heading",
          level: 2,
          icon: "i-ph-text-h-two",
          label: "Heading 2",
        },
        {
          kind: "heading",
          level: 3,
          icon: "i-ph-text-h-three",
          label: "Heading 3",
        },
        {
          kind: "heading",
          level: 4,
          icon: "i-ph-text-h-four",
          label: "Heading 4",
        },
      ],
    },
    {
      icon: "i-ph-list",
      tooltip: { text: "Lists" },
      content: {
        align: "start",
      },
      items: [
        {
          kind: "bulletList",
          icon: "i-ph-list-bullets",
          label: "Bullet List",
        },
        {
          kind: "orderedList",
          icon: "i-ph-list-numbers",
          label: "Ordered List",
        },
      ],
    },
    {
      kind: "blockquote",
      icon: "i-ph-text-indent",
      tooltip: { text: "Blockquote" },
    },
    {
      kind: "horizontalRule",
      icon: "i-ph-arrows-in-line-vertical",
      tooltip: { text: "Horizontal Rule" },
    },
  ],
  // Text formatting
  [
    {
      kind: "mark",
      mark: "bold",
      icon: "i-ph-text-b",
      tooltip: { text: "Bold" },
    },
    {
      kind: "mark",
      mark: "italic",
      icon: "i-ph-text-italic",
      tooltip: { text: "Italic" },
    },
    {
      kind: "mark",
      mark: "underline",
      icon: "i-ph-text-underline",
      tooltip: { text: "Underline" },
    },
    {
      kind: "mark",
      mark: "strike",
      icon: "i-ph-text-strikethrough",
      tooltip: { text: "Strikethrough" },
    },
  ],
  // Link
  [
    {
      kind: "link",
      icon: "i-ph-link",
      tooltip: { text: "Link" },
    },
  ],
  // Text alignment
  [
    {
      icon: "i-ph-text-align-justify",
      tooltip: { text: "Text Align" },
      content: {
        align: "end",
      },
      items: [
        {
          kind: "textAlign",
          align: "left",
          icon: "i-ph-text-align-left",
          label: "Align Left",
        },
        {
          kind: "textAlign",
          align: "center",
          icon: "i-ph-text-align-center",
          label: "Align Center",
        },
        {
          kind: "textAlign",
          align: "right",
          icon: "i-ph-text-align-right",
          label: "Align Right",
        },
        {
          kind: "textAlign",
          align: "justify",
          icon: "i-ph-text-align-justify",
          label: "Align Justify",
        },
      ],
    },
  ],
  [
    {
      kind: "imageUpload",
      icon: "i-ph-image",
      tooltip: { text: "Upload Image" },
    },
  ],
];

const customHandlers = {
  imageUpload: {
    canExecute: (editor) => editor.can().insertContent({ type: "imageUpload" }),
    execute: (editor) =>
      editor.chain().focus().insertContent({ type: "imageUpload" }),
    isActive: (editor) => editor.isActive("imageUpload"),
    isDisabled: undefined,
  },
} satisfies EditorCustomHandlers;
</script>

<template>
  <UEditor
    v-slot="{ editor }"
    v-model="model"
    content-type="markdown"
    :handlers="customHandlers"
    :extensions="[
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ImageUpload as any,
    ]"
    placeholder="Začnite písať popis podujatia..."
    class="w-full min-h-37 flex flex-col gap-4">
    <UEditorToolbar
      :editor="editor"
      :items="items"
      class="sm:px-8 overflow-x-auto border-b border-default" />
  </UEditor>
</template>
