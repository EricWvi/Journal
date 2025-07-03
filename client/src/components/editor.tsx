import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Smile,
  Highlighter,
  Bold,
  Italic,
  Underline,
  Strikethrough,
} from "lucide-react";
import EmojiPicker, { emojiClassName } from "@/components/emoji-picker";
import PhotoPicker from "@/components/photo-picker";
import { dumpHtmlNodes, Node, NodeType } from "@/lib/html-parse";
import { Entry } from "@shared/schema";

export interface EditorHandle {
  dumpEditorContent: () => Node[];
}

type Props = {
  editingEntry: Entry | null;
};

const WYSIWYG = forwardRef((props: Props, ref) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // Focus on mount
    editorFocus();
  }, []);

  const savedSelectionRef = useRef<Range | null>(null);

  const saveSelection = (): void => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const handleBlur = () => {
    saveSelection();
  };

  const editorFocus = () => {
    editorRef.current?.focus();
    if (editorRef.current && savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    } else {
      if (editorRef.current) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false); // false means collapse to end
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  };

  const dumpEditorContent = () => {
    if (editorRef.current) {
      const content = dumpHtmlNodes(editorRef.current.childNodes);
      return content;
    }
    return [];
  };

  useImperativeHandle(ref, () => ({
    dumpEditorContent,
  }));

  const handleHtmlDump = () => {
    const dumpNodes = dumpEditorContent();
    console.log("Dump Output:", dumpNodes);
  };

  const formatText = useCallback((command: string) => {
    document.execCommand(command, false, undefined);
    editorRef.current?.focus();
  }, []);

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-gray-50 p-3">
        {/* Text formatting */}
        <button
          onClick={() => formatText("bold")}
          className="rounded p-2 transition-colors hover:bg-gray-200"
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => formatText("italic")}
          className="rounded p-2 transition-colors hover:bg-gray-200"
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => formatText("underline")}
          className="rounded p-2 transition-colors hover:bg-gray-200"
          title="Underline"
        >
          <Underline size={18} />
        </button>
        <button
          onClick={() => formatText("strikethrough")}
          className="rounded p-2 transition-colors hover:bg-gray-200"
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>
        <button
          onClick={() => formatText("mark")}
          className="rounded p-2 transition-colors hover:bg-gray-200"
          title="Highlighter"
        >
          <Highlighter size={18} />
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300"></div>

        {/* Emoji picker */}
        <button
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            editorFocus();
          }}
          className={`flex items-center gap-2 rounded px-3 py-2 transition-colors ${
            showEmojiPicker
              ? "bg-blue-500 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          <Smile size={18} />
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300"></div>

        {/* Clear button */}
        <button
          onClick={handleHtmlDump}
          className="rounded bg-red-100 px-3 py-2 text-red-700 transition-colors hover:bg-red-200"
        >
          Dump
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300"></div>
        <PhotoPicker editorFocus={editorFocus} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && <EmojiPicker editorFocus={editorFocus} />}

      {/* TODO placeholder */}
      {/* TODO 提取 editor 和 card 的 parse 部分，以及处理 image */}
      {/* WYSIWYG Editor */}
      <div className="mb-4">
        <div
          ref={editorRef}
          contentEditable
          onBlur={handleBlur}
          className="h-[40vh] w-full overflow-y-auto bg-white p-3 text-lg/6 outline-none"
          suppressContentEditableWarning={true}
        >
          {props.editingEntry?.content.map((node, index) => {
            switch (node.type) {
              case NodeType.TEXT:
                return <span key={index}>{node.content}</span>;
              case NodeType.BREAK:
                return <br key={index} />;
              case NodeType.EMOJI:
                return (
                  <span
                    key={index}
                    draggable={false}
                    contentEditable={false}
                    data-emoji-id={node.content}
                    className={emojiClassName(node.content ?? "")}
                  ></span>
                );
              default:
                return null;
            }
          })}
        </div>
      </div>
      <img ref={imgRef}></img>
    </div>
  );
});

export default WYSIWYG;
