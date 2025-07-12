import {
  Clock,
  Edit,
  Heart,
  MapPin,
  MoreHorizontal,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NodeType } from "@/lib/html-parse";
import { emojiClassName } from "./emoji-picker";
import { EntryMeta, useEntry } from "@/hooks/use-entries";

interface EntryCardProps {
  meta: EntryMeta;
  onEdit: () => void;
}

export default function EntryCard({ meta, onEdit }: EntryCardProps) {
  const { data: entry, isLoading } = useEntry(meta.id);

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
        return <Smile className="h-4 w-4" />;
      case "grateful":
        return <Heart className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  return (
    <>
      {!isLoading && entry && (
        <Card className="apple-shadow overflow-hidden transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 text-sm text-[hsl(215,4%,56%)]">
                  <span>{formatDate(entry.createdAt)}</span>
                  <span>{formatTime(entry.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="hover:text-foreground p-2 text-[hsl(215,4%,56%)]"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:text-foreground p-2 text-[hsl(215,4%,56%)]"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="prose prose-sm mb-6 max-w-none">
              <p className="text-foreground line-clamp-3 leading-relaxed">
                {entry.content
                  .filter((node) => node.type !== NodeType.IMAGE)
                  .map((node, index) => {
                    switch (node.type) {
                      case NodeType.TEXT:
                        return <span key={index}>{node.content}</span>;
                      case NodeType.BREAK:
                        return <br key={index} />;
                      case NodeType.EMOJI:
                        return (
                          <span
                            key={index}
                            draggable={false}
                            contentEditable={false}
                            className={emojiClassName(node.content ?? "")}
                          ></span>
                        );
                      default:
                        return <></>;
                    }
                  })}
              </p>
            </div>

            <div className="border-border flex items-center justify-between border-t pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-sm font-medium text-[hsl(207,90%,54%)] hover:text-[hsl(207,90%,48%)]"
              >
                Read more
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
