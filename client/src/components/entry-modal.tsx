import { useEffect, useRef, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  VisuallyHidden,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useEntry,
  useCreateEntryFromDraft,
  useUpdateDraft,
  useUpdateEntry,
} from "@/hooks/use-entries";
import { Visibility } from "@shared/schema";
import WYSIWYG, { EditorHandle } from "@/components/editor";
import { outTrash } from "@/hooks/use-apis";

interface EntryModalProps {
  open: boolean;
  onClose: () => void;
  entryId: number;
  refresh: () => void;
}

export default function EntryModal({
  open,
  onClose,
  entryId,
  refresh,
}: EntryModalProps) {
  const { data: editingEntry, isLoading } = useEntry(entryId);
  const [visModal, setVisModal] = useState(
    editingEntry?.visibility || Visibility.PUBLIC,
  );

  const editorRef = useRef<EditorHandle>(null);
  const { toast } = useToast();
  const createEntryMutation = useCreateEntryFromDraft();
  const updateEntryMutation = useUpdateEntry();
  const updateDraftMutation = useUpdateDraft();

  if (isLoading || !editingEntry) return <></>;

  const handleSave = async (discard: boolean) => {
    const [dump, newIds, trash] = editorRef.current?.dumpEditorContent() || [
      [],
      [],
      [],
    ];
    const entryData = {
      content: dump,
      visibility: visModal,
      payload: {},
    };

    try {
      if (editingEntry.visibility !== Visibility.DRAFT) {
        if (!discard) {
          if (trash.length > 0) {
            outTrash(trash);
          }
          await updateEntryMutation.mutateAsync({
            id: editingEntry.id,
            ...entryData,
          });
        } else {
          if (newIds.length > 0) {
            outTrash(newIds);
          }
        }
      } else if (editingEntry.visibility === Visibility.DRAFT) {
        if (trash.length > 0) {
          outTrash(trash);
        }
        if (discard) {
          await updateDraftMutation.mutateAsync({
            id: editingEntry.id,
            ...entryData,
            visibility: Visibility.DRAFT,
          });
        } else {
          await createEntryMutation.mutateAsync({
            ...entryData,
            id: editingEntry.id,
            visibility:
              visModal != Visibility.DRAFT ? visModal : Visibility.PUBLIC,
          });
          refresh();
        }
      }

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
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
        // setPhotos((prev) => [...prev, ...result.photos]);
        toast({
          title: "Photos Uploaded",
          description: `${result.photos.length} photo(s) added to your entry.`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => handleSave(true)}>
      <VisuallyHidden>
        <DialogTitle>Entry Editor</DialogTitle>
        <DialogDescription>Entry Content</DialogDescription>
      </VisuallyHidden>
      <DialogContent className="top-12 bottom-0 overflow-hidden p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-border flex items-center justify-between border-b p-6">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">{getCurrentDateTime()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={
                  // createEntryMutation.isPending || updateEntryMutation.isPending
                  updateEntryMutation.isPending
                }
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>

          {/* <label className="cursor-pointer">
                <Button variant="ghost" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                  </span>
                </Button>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label> */}
          <WYSIWYG ref={editorRef} editingEntry={editingEntry} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
