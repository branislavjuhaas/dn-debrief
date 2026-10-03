import { Node, mergeAttributes } from "@tiptap/core";
import type { CommandProps, NodeViewRenderer } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import type { Component } from "vue";
import FileUploadNodeComponent from "./DescriptionEditorFileUploadNode.vue";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fileUpload: {
      insertFileUpload: () => ReturnType;
    };
  }
}

export const FileUpload = Node.create({
  name: "fileUpload",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {};
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-type="file-upload"]',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "file-upload" }),
    ];
  },
  addNodeView(): NodeViewRenderer {
    return VueNodeViewRenderer(FileUploadNodeComponent as Component);
  },
  addCommands() {
    return {
      insertFileUpload:
        () =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({ type: this.name });
        },
    };
  },
});

export default FileUpload;
