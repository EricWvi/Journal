import React, { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

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
        insertImage(result.photos[0]);
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    }
  };

  const insertImage = (src: string) => {
    editorFocus();

    // Get current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    const imgContainer = document.createElement("div");
    imgContainer.className = "img-react-container";
    imgContainer.contentEditable = "false";
    imgContainer.draggable = false;

    // Example: Render a React component (e.g., <imgComponent img={img} />) into imgContainer
    // You need to import ReactDOM from "react-dom/client" (for React 18+)
    import("react-dom/client").then(({ createRoot }) => {
      createRoot(imgContainer).render(<EditorPhoto imgSrc={src} />);
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
        className="hidden"
        onChange={handleFileUpload}
      />
    </label>
  );
};

type PhotoProps = {
  imgSrc: string;
};

const EditorPhoto = ({ imgSrc }: PhotoProps) => {
  return <img src={imgSrc} alt="img" />;
};

export default PhotoPicker;
