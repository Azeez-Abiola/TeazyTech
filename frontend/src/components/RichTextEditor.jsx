import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";

import { createLowlight, common } from "lowlight";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImgIcon,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Undo,
  Redo,
} from "lucide-react";

const lowlight = createLowlight(common);

const RichTextEditor = ({ value, onChange, uploadImage }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Blockquote,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder: "Write your post content here...",
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-full focus:outline-none p-4 min-h-[150px]",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const insertImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (typeof uploadImage !== "function") {
      console.warn("No uploadImage function provided");
      return;
    }

    try {
      const url = await uploadImage(file);
      if (url) editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      e.target.value = "";
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = prompt("Enter URL", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const btnClass = (isActive) =>
    `p-1.5 rounded hover:bg-gray-200 transition-colors ${
      isActive ? "bg-gray-300 text-black" : "text-gray-600"
    }`;

  return (
    <div className="relative border rounded-md bg-white shadow-sm">
      <div className="flex flex-wrap gap-1 bg-gray-50 p-2 border-b rounded-t-md sticky top-0 z-10">
        <div className="flex items-center gap-1 border-r pr-2 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r pr-2 mr-1">
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={btnClass(editor.isActive("heading", { level: 1 }))}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={btnClass(editor.isActive("heading", { level: 2 }))}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={btnClass(editor.isActive("heading", { level: 3 }))}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r pr-2 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().setFontFamily("Inter").run()}
            className={btnClass(
              editor.isActive("textStyle", { fontFamily: "Inter" }),
            )}
            title="Sans Serif"
          >
            <span className="text-xs font-sans font-bold">Sans</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setFontFamily("serif").run()}
            className={btnClass(
              editor.isActive("textStyle", { fontFamily: "serif" }),
            )}
            title="Serif"
          >
            <span className="text-xs font-serif font-bold">Serif</span>
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().setFontFamily("monospace").run()
            }
            className={btnClass(
              editor.isActive("textStyle", { fontFamily: "monospace" }),
            )}
            title="Monospace"
          >
            <span className="text-xs font-mono font-bold">Mono</span>
          </button>
        </div>

        <div className="flex items-center gap-1 border-r pr-2 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={btnClass(editor.isActive("bold"))}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={btnClass(editor.isActive("italic"))}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={btnClass(editor.isActive("underline"))}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={btnClass(editor.isActive("strike"))}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={btnClass(editor.isActive("highlight"))}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r pr-2 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={btnClass(editor.isActive({ textAlign: "left" }))}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={btnClass(editor.isActive({ textAlign: "center" }))}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={btnClass(editor.isActive({ textAlign: "right" }))}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={btnClass(editor.isActive({ textAlign: "justify" }))}
            title="Align Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={btnClass(editor.isActive("bulletList"))}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={btnClass(editor.isActive("orderedList"))}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={setLink}
            className={btnClass(editor.isActive("link"))}
            title="Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          <label
            className="p-1.5 rounded hover:bg-gray-200 cursor-pointer text-gray-600"
            title="Upload Image"
          >
            <ImgIcon className="h-4 w-4" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={insertImageFile}
            />
          </label>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
