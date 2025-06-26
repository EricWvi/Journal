import React, { useState, useRef, useCallback, useEffect } from "react";
import { Smile, Image, Bold, Italic, Underline } from "lucide-react";
import { wechatEmojis, type WechatEmoji } from "@/lib/wechat-emoji";

const WYSIWYG = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Set up the editor with basic styling
    if (editorRef.current) {
      editorRef.current.style.minHeight = "200px";
      editorRef.current.style.padding = "12px";
      editorRef.current.style.outline = "none";
      editorRef.current.style.fontSize = "16px";
      editorRef.current.style.lineHeight = "1.5";
    }
  }, []);

  interface InsertEmojiFn {
    (emoji: WechatEmoji): void;
  }

  const insertEmoji: InsertEmojiFn = useCallback((emoji) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    // Get current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    // Create emoji image element
    const img = document.createElement("img");
    img.src = emoji.url;
    img.alt = emoji.name;
    img.className = "inline-emoji";
    img.style.width = "24px";
    img.style.height = "24px";
    img.style.verticalAlign = "middle";
    img.style.margin = "0 2px";
    img.style.display = "inline-block";
    img.contentEditable = "false";
    img.draggable = false;

    // Insert the emoji at cursor position
    range.deleteContents();
    range.insertNode(img);

    // Add a space after the emoji for better UX
    const space = document.createTextNode(" ");
    range.insertNode(space);

    // Move cursor after the space
    range.setStartAfter(space);
    range.setEndAfter(space);
    selection.removeAllRanges();
    selection.addRange(range);

    setShowEmojiPicker(false);
  }, []);

  const formatText = useCallback((command) => {
    document.execCommand(command, false, null);
    editorRef.current?.focus();
  }, []);

  const handleEditorFocus = useCallback(() => {
    setShowEmojiPicker(false);
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
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`flex items-center gap-2 rounded px-3 py-2 transition-colors ${
            showEmojiPicker
              ? "bg-blue-500 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          <Smile size={18} />
          Emojis
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300"></div>

        {/* Clear button */}
        <button
          onClick={clearEditor}
          className="rounded bg-red-100 px-3 py-2 text-red-700 transition-colors hover:bg-red-200"
        >
          Clear
        </button>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="mb-4 rounded-lg border-2 border-blue-200 bg-white p-4 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Click to insert emoji
          </h3>
          <div className="grid max-h-48 grid-cols-8 gap-2 overflow-y-auto sm:grid-cols-10 md:grid-cols-12">
            {wechatEmojis.map((emoji: WechatEmoji) => (
              <div key={emoji.id} className="group relative">
                <button
                  onClick={() => insertEmoji(emoji)}
                  className="flex h-10 w-10 items-center justify-center rounded border border-gray-300 transition-colors hover:border-blue-300 hover:bg-blue-50"
                  title={emoji.name}
                >
                  <img
                    src={emoji.url}
                    alt={emoji.name}
                    className="h-6 w-6 object-contain"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WYSIWYG Editor */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Rich Text Editor
        </label>
        <div
          ref={editorRef}
          contentEditable
          onFocus={handleEditorFocus}
          className="min-h-48 w-full rounded-lg border-2 border-gray-300 bg-white p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          style={{ outline: "none" }}
          suppressContentEditableWarning={true}
        />
      </div>

      {/* HTML Output (for debugging/export) */}
      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <h4 className="mb-2 text-sm font-semibold text-gray-700">
          HTML Output:
        </h4>
        <div className="overflow-x-auto rounded border bg-white p-2 font-mono text-xs text-gray-600">
          {getEditorContent()}
        </div>
      </div>
    </div>
  );
};

export default WYSIWYG;
