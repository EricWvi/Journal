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

    // const formData = new FormData();
    // Array.from(files).forEach((file) => {
    //   formData.append("photos", file);
    // });

    try {
      // const response = await fetch("/api/upload", {
      //   method: "POST",
      //   body: formData,
      // });

      // if (response.ok) {
      //   const result = await response.json();
      //   insertImage(result.photos[0]);
      // }
      const imgUrls = compressedFiles.map((file) => URL.createObjectURL(file));
      insertImage(imgUrls);
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

    const imgContainer = document.createElement("span");
    imgContainer.className = "block w-full";
    imgContainer.contentEditable = "false";
    imgContainer.draggable = false;

    import("react-dom/client").then(({ createRoot }) => {
      createRoot(imgContainer).render(<PhotoList imgs={imgs} />);
    });

    // Insert the img at cursor position
    range.deleteContents();
    range.insertNode(imgContainer);

    // Move cursor after the img
    range.setStartAfter(imgContainer);
    range.setEndAfter(imgContainer);
    selection.removeAllRanges();
    selection.addRange(range);
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
  onDelete: (src: string) => void;
};

const EditorPhoto = ({ imgSrc, onDelete }: PhotoProps) => {
  return (
    <span className="relative block aspect-[4/3] w-full bg-gray-500">
      <button
        onClick={() => onDelete(imgSrc)}
        className="absolute text-red-500"
      >
        x
      </button>
      <img className="h-full w-full object-contain" src={imgSrc} alt="img" />
    </span>
  );
};

const PhotoList = ({ imgs }: { imgs: string[] }) => {
  const [items, setItems] = useState(imgs);
  const handleDelete = (src: string) => {
    setItems((prevItems) => prevItems.filter((item) => item !== src));
  };
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((src, idx) => (
        <EditorPhoto key={idx} imgSrc={src} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default PhotoPicker;
