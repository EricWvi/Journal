import React, { useState, useRef, useCallback, useEffect } from "react";
import { Smile, Image, Bold, Italic, Underline } from "lucide-react";
import EmojiPicker from "@/components/emoji-picker";
import PhotoPicker from "@/components/photo-picker";
import { preloadImages } from "@/lib/wechat-emoji";

const WYSIWYG = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // Focus on mount
    editorFocus();
    // Preload all images when the component mounts
    // const imageUrls = wechatEmojis.map((emoji) => emoji.url);
    preloadImages(["/assets/wechat-emoji-sprite.png"]);
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

  const formatText = useCallback((command: string) => {
    document.execCommand(command, false, undefined);
    editorRef.current?.focus();
  }, []);

  const getEditorContent = useCallback(() => {
    return editorRef.current?.innerHTML || "";
  }, []);

  const clearEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      editorRef.current.focus();
    }
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
          onClick={clearEditor}
          className="rounded bg-red-100 px-3 py-2 text-red-700 transition-colors hover:bg-red-200"
        >
          Clear
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300"></div>
        <PhotoPicker editorFocus={editorFocus} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && <EmojiPicker editorFocus={editorFocus} />}

      {/* TODO placeholder */}
      {/* WYSIWYG Editor */}
      <div className="mb-4">
        <div
          ref={editorRef}
          contentEditable
          onBlur={handleBlur}
          className="h-[40vh] w-full overflow-y-auto bg-white p-3 text-lg/6 outline-none"
          suppressContentEditableWarning={true}
        >
          好的好的
          <br />
          好的好的
        </div>
      </div>
      {/* HTML Output (for debugging/export) */}
      {/* <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <h4 className="mb-2 text-sm font-semibold text-gray-700">
          HTML Output:
        </h4>
        <div className="overflow-x-auto rounded border bg-white p-2 font-mono text-xs text-gray-600">
          {getEditorContent()}
        </div>
      </div> */}
      <img ref={imgRef}></img>
    </div>
  );
};

export default WYSIWYG;
