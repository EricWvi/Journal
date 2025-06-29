import React, { useState, useRef, useCallback, useEffect } from "react";
import { Smile, Image, Bold, Italic, Underline } from "lucide-react";
import {
  preloadImages,
  wechatEmojis,
  type WechatEmoji,
} from "@/lib/wechat-emoji";
import { useToast } from "@/hooks/use-toast";

const WYSIWYG = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // Focus on mount
    editorFocus();
  }, []);
  const { toast } = useToast();

  const savedSelectionRef = useRef<Range | null>(null);

  const saveSelection = (): void => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
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

  const handleBlur = () => {
    saveSelection();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("photos", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        imgRef.current!.src = result.photos[0]; // Assuming the API returns an array of photo URLs
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Preload all images when the component mounts
    // const imageUrls = wechatEmojis.map((emoji) => emoji.url);
    preloadImages(["/assets/wechat-emoji-sprite.png"]);
  }, []);

  const insertEmoji = useCallback((emoji: WechatEmoji) => {
    const editor = editorRef.current;
    if (!editor) return;

    editorFocus();

    // Get current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    // Create emoji element
    const emojiSpan = document.createElement("span");
    emojiSpan.className = `wechat-emoji mx-0.5 inline-block h-6 w-6 object-contain align-bottom [zoom:0.1875] ${emoji.id}`;
    emojiSpan.contentEditable = "false";
    emojiSpan.draggable = false;

    // Insert the emoji at cursor position
    range.deleteContents();
    range.insertNode(emojiSpan);

    // Move cursor after the emoji
    range.setStartAfter(emojiSpan);
    range.setEndAfter(emojiSpan);
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

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

        <label className="rounded bg-blue-100 px-3 py-2">
          🏙️
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="mb-4 rounded-lg border-2 border-blue-200 bg-white p-4 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Click to insert emoji
          </h3>
          <div className="grid max-h-48 grid-cols-[repeat(8,40px)] overflow-y-auto sm:grid-cols-10 sm:gap-2 md:grid-cols-12">
            {wechatEmojis.map((emoji: WechatEmoji) => (
              <div key={emoji.id} className="relative">
                <button
                  onClick={() => insertEmoji(emoji)}
                  className="flex h-10 w-10 items-center justify-center rounded transition-colors sm:border sm:border-gray-300 sm:hover:border-blue-300 sm:hover:bg-blue-50"
                  title={emoji.name}
                >
                  <span
                    className={`wechat-emoji h-6 w-6 object-contain [zoom:0.1875] ${emoji.id}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TODO placeholder */}
      {/* WYSIWYG Editor */}
      <div className="mb-4">
        <div
          ref={editorRef}
          contentEditable
          onBlur={handleBlur}
          className="min-h-48 w-full bg-white p-3 text-lg/6 outline-none"
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
