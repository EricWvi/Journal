import { Clock, Edit, Heart, MapPin, MoreHorizontal, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Entry } from "@shared/schema";

interface EntryCardProps {
  entry: Entry;
  onEdit: () => void;
}

export default function EntryCard({ entry, onEdit }: EntryCardProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200); // Average reading speed
    return `${minutes} min read`;
  };

  const renderMoodIcon = (mood?: string) => {
    switch (mood?.toLowerCase()) {
      case "happy":
        return <Smile className="w-4 h-4" />;
      case "grateful":
        return <Heart className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <Card className="apple-shadow hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {entry.title}
            </h2>
            <div className="flex items-center text-[hsl(215,4%,56%)] text-sm space-x-4">
              <span>{formatDate(entry.createdAt)}</span>
              <span>{formatTime(entry.createdAt)}</span>
              {entry.weather && (
                <span className="flex items-center space-x-1">
                  <span>{entry.weather}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="p-2 text-[hsl(215,4%,56%)] hover:text-foreground"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-[hsl(215,4%,56%)] hover:text-foreground"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {entry.photos && entry.photos.length > 0 && (
          <div className="mb-4">
            <img
              src={entry.photos[0]}
              alt="Entry photo"
              className="w-full h-48 object-cover rounded-xl"
            />
          </div>
        )}

        <div className="prose prose-sm max-w-none mb-6">
          <p className="text-foreground leading-relaxed line-clamp-3">
            {entry.content}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-4 text-[hsl(215,4%,56%)] text-sm">
            {entry.mood && (
              <span className="flex items-center space-x-1">
                {renderMoodIcon(entry.mood)}
                <span className="capitalize">{entry.mood}</span>
              </span>
            )}
            {entry.photos && entry.photos.length > 0 && (
              <span className="flex items-center space-x-1">
                <span>{entry.photos.length} photo{entry.photos.length > 1 ? 's' : ''}</span>
              </span>
            )}
            {entry.location && (
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{entry.location}</span>
              </span>
            )}
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{getReadTime(entry.content)}</span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-[hsl(207,90%,54%)] hover:text-[hsl(207,90%,48%)] text-sm font-medium"
          >
            Read more
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
