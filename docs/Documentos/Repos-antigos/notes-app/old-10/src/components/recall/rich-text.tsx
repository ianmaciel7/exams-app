"use client";
import {
  type Editor,
  EditorContent,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { type ComponentType, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { RichNode } from "@/domain/recall";

export type RichValue = { type: "doc"; content?: RichNode[] };
export const emptyDoc: RichValue = { type: "doc", content: [] };

const extensions = [StarterKit];

const controls: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
}[] = [
  {
    label: "Bold",
    icon: Bold,
    isActive: (editor) => editor.isActive("bold"),
    run: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    label: "Italic",
    icon: Italic,
    isActive: (editor) => editor.isActive("italic"),
    run: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    label: "Heading",
    icon: Heading2,
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: "Bullet list",
    icon: List,
    isActive: (editor) => editor.isActive("bulletList"),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Numbered list",
    icon: ListOrdered,
    isActive: (editor) => editor.isActive("orderedList"),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: "Quote",
    icon: Quote,
    isActive: (editor) => editor.isActive("blockquote"),
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    label: "Code",
    icon: Code,
    isActive: (editor) => editor.isActive("code"),
    run: (editor) => editor.chain().focus().toggleCode().run(),
  },
];

export function RichTextEditor({
  defaultValue,
  onChange,
  label,
}: {
  defaultValue: RichValue;
  onChange: (value: RichValue) => void;
  label: string;
}) {
  // The editor owns its document. Feeding the parent's state back in as
  // `content` re-applies it on every keystroke, which silently discards
  // structure the editor just created (a new list reverts to a paragraph).
  const notify = useRef(onChange);
  notify.current = onChange;
  const editor = useEditor(
    {
      extensions,
      content: defaultValue,
      // Next renders this on the server first; rendering the editor there
      // would desynchronise ProseMirror's DOM from React's and break
      // hydration.
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: "rich-text min-h-32 px-3 py-2",
          "aria-label": label,
        },
      },
      onUpdate: ({ editor: current }) =>
        notify.current(current.getJSON() as RichValue),
    },
    [],
  );
  const active = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      controls.map((control) => (current ? control.isActive(current) : false)),
  });
  return (
    <div className="rounded-lg border border-input bg-background">
      <div className="flex flex-wrap gap-1 border-b border-input p-1">
        {controls.map((control, index) => (
          <Button
            key={control.label}
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={control.label}
            aria-pressed={active?.[index] ?? false}
            disabled={!editor}
            onClick={() => editor && control.run(editor)}
          >
            <control.icon className="size-4" />
          </Button>
        ))}
      </div>
      {/* Matches the editor's own min height so the border does not jump. */}
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="min-h-32 px-3 py-2" />
      )}
    </div>
  );
}

export function RichText({ doc }: { doc: RichValue }) {
  const editor = useEditor({
    extensions,
    content: doc,
    editable: false,
    immediatelyRender: false,
    editorProps: { attributes: { class: "rich-text" } },
  });
  return editor ? <EditorContent editor={editor} /> : null;
}
