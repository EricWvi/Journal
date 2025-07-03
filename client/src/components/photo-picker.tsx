import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import imageCompression from "browser-image-compression";

type Props = {
  editorFocus: () => void;
};

const PhotoPicker = ({ editorFocus }: Props) => {
  const { toast } = useToast();
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    const options = {
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      preserveExif: true,
      initialQuality: 0.8,
    };
    const compressedFiles: File[] = await Promise.all(
      Array.from(files).map(async (file) => {
        try {
          return await imageCompression(file, options);
        } catch (error) {
          return file;
        }
      }),
    );

    const formData = new FormData();
    Array.from(compressedFiles).forEach((file) => {
      formData.append("photos", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        insertImage(result.photos);
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    }
  };

  const insertImage = (imgs: string[]) => {
    editorFocus();

    // Get current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    imgs.forEach((imgSrc) => {
      const imgContainer = document.createElement("span");
      imgContainer.className = "block aspect-[4/3] w-full bg-gray-500";
      imgContainer.contentEditable = "false";
      imgContainer.draggable = false;

      import("react-dom/client").then(({ createRoot }) => {
        createRoot(imgContainer).render(<EditorPhoto imgSrc={imgSrc} />);
      });

      // Insert the img at cursor position
      range.deleteContents();
      range.insertNode(imgContainer);
      range.setStartAfter(imgContainer);
      range.setEndAfter(imgContainer);

      const br = document.createElement("br");
      range.insertNode(br);
      range.setStartAfter(br);
      range.setEndAfter(br);

      selection.removeAllRanges();
      selection.addRange(range);
    });
  };

  return (
    <label className="rounded bg-blue-100 px-3 py-2">
      🏙️
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />
    </label>
  );
};

type PhotoProps = {
  imgSrc: string;
};

export const EditorPhoto = ({ imgSrc }: PhotoProps) => {
  return (
    <img className="h-full w-full object-contain" src={imgSrc} alt="img" />
  );
};

export default PhotoPicker;
