import { useState, useEffect } from "react";
import { X, Save, Upload, MapPin, Smile, Bold, Italic, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useEntries, useCreateEntry, useUpdateEntry } from "@/hooks/use-entries";
import type { Entry } from "@shared/schema";

interface EntryModalProps {
  open: boolean;
  onClose: () => void;
  editingId?: number | null;
}

export default function EntryModal({ open, onClose, editingId }: EntryModalProps) {
  const [title, setTitle] = useState("");
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

  const editingEntry = editingId ? entries.find(e => e.id === editingId) : null;

  useEffect(() => {
    if (open) {
      if (editingEntry) {
        setTitle(editingEntry.title);
        setContent(editingEntry.content);
        setMood(editingEntry.mood || "");
        setLocation(editingEntry.location || "");
        setWeather(editingEntry.weather || "");
        setPhotos(editingEntry.photos || []);
      } else {
        // Reset for new entry
        setTitle("");
        setContent("");
        setMood("");
        setLocation("");
        setWeather("");
        setPhotos([]);
      }
    }
  }, [open, editingEntry]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both a title and content for your entry.",
        variant: "destructive",
      });
      return;
    }

    const entryData = {
      title: title.trim(),
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
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('photos', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setPhotos(prev => [...prev, ...result.photos]);
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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-foreground">
                {editingEntry ? "Edit Entry" : "New Entry"}
              </h2>
              <span className="text-[hsl(215,4%,56%)] text-sm">
                {getCurrentDateTime()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={createEntryMutation.isPending || updateEntryMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingEntry ? "Update" : "Save"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Title Input */}
          <div className="p-6 border-b border-border">
            <Input
              placeholder="Entry title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-semibold border-none outline-none bg-transparent placeholder-[hsl(215,4%,56%)] p-0 h-auto focus-visible:ring-0"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Bold className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Italic className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <List className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ListOrdered className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border"></div>
              <label className="cursor-pointer">
                <Button variant="ghost" size="sm" asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                  </span>
                </Button>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
              <Button variant="ghost" size="sm">
                <MapPin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Smile className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2 text-[hsl(215,4%,56%)] text-sm">
              <Save className="w-4 h-4" />
              <span>{autoSaveStatus}</span>
            </div>
          </div>

          {/* Content Editor */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] text-lg leading-relaxed border-none resize-none focus-visible:ring-0 p-0"
              />
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="p-6 bg-muted border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                placeholder="Mood (e.g., Happy, Grateful)"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              />
              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Input
                placeholder="Weather"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-[hsl(215,4%,56%)]">
                {photos.length > 0 && (
                  <span>{photos.length} photo{photos.length > 1 ? 's' : ''} attached</span>
                )}
              </div>
              <div className="text-[hsl(215,4%,56%)]">
                {content.split(/\s+/).length} words
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
