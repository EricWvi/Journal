import { useState, useEffect } from "react";
import {
  X,
  Save,
  Upload,
  MapPin,
  Smile,
  Bold,
  Italic,
  List,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useEntries,
  useCreateEntry,
  useUpdateEntry,
} from "@/hooks/use-entries";
import type { Entry } from "@shared/schema";
import WYSIWYG from "./editor";

interface EntryModalProps {
  open: boolean;
  onClose: () => void;
  editingId?: number | null;
}

export default function EntryModal({
  open,
  onClose,
  editingId,
}: EntryModalProps) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState("Auto-saved");

  const { toast } = useToast();
  const { data: entries = [] } = useEntries();
  const createEntryMutation = useCreateEntry();
  const updateEntryMutation = useUpdateEntry();

  const editingEntry = editingId
    ? entries.find((e) => e.id === editingId)
    : null;

  useEffect(() => {
    if (open) {
      if (editingEntry) {
        setContent(editingEntry.content);
        // setMood(editingEntry.mood || "");
        // setLocation(editingEntry.location || "");
        // setWeather(editingEntry.weather || "");
        // setPhotos(editingEntry.photos || []);
      } else {
        // Reset for new entry
        setContent("");
        setMood("");
        setLocation("");
        setWeather("");
        setPhotos([]);
      }
    }
  }, [open, editingEntry]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "信息缺失",
        description: "请在记录中输入正文内容",
        variant: "destructive",
      });
      return;
    }

    const entryData = {
      content: content.trim(),
      mood: mood.trim() || undefined,
      location: location.trim() || undefined,
      weather: weather.trim() || undefined,
      photos: photos.length > 0 ? photos : undefined,
    };

    try {
      if (editingId && editingEntry) {
        await updateEntryMutation.mutateAsync({ id: editingId, ...entryData });
        toast({
          title: "Entry Updated",
          description: "Your journal entry has been updated successfully.",
        });
      } else {
        await createEntryMutation.mutateAsync(entryData);
        toast({
          title: "Entry Created",
          description: "Your journal entry has been saved successfully.",
        });
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
        setPhotos((prev) => [...prev, ...result.photos]);
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bottom-0 top-12 overflow-hidden p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-6">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">{getCurrentDateTime()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={
                  createEntryMutation.isPending || updateEntryMutation.isPending
                }
              >
                <Save className="mr-2 h-4 w-4" />
                {editingEntry ? "Update" : "Save"}
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

          {/* Content Editor */}
          {/* <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] resize-none border-none p-0 text-lg leading-relaxed focus-visible:ring-0"
              />
            </div>
          </div> */}
          <WYSIWYG />

          {/* Metadata Footer */}
          {/* <div className="border-t border-border bg-muted p-6">
            <div className="flex items-center justify-between text-sm">
              <div className="text-[hsl(215,4%,56%)]">
                {photos.length > 0 && (
                  <span>
                    {photos.length} photo{photos.length > 1 ? "s" : ""} attached
                  </span>
                )}
              </div>
              <div className="text-[hsl(215,4%,56%)]">
                {content.split(/\s+/).length} words
              </div>
            </div>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
