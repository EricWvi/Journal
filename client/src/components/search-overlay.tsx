import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");

  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/entries/search", query],
    enabled: query.length > 2,
    queryFn: async () => {
      if (query.length <= 2) return [];
      const response = await fetch(`/api/entries/search/${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Search className="text-[hsl(215,4%,56%)]" />
            <Input
              placeholder="Search your journal entries..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-lg border-none outline-hidden bg-transparent focus-visible:ring-0"
              autoFocus
            />
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-4">
          {query.length <= 2 ? (
            <p className="text-[hsl(215,4%,56%)] text-center py-8">
              Type at least 3 characters to search
            </p>
          ) : searchResults.length === 0 ? (
            <p className="text-[hsl(215,4%,56%)] text-center py-8">
              No entries found for "{query}"
            </p>
          ) : (
            <div className="space-y-3">
              {searchResults.map((entry: any) => (
                <div
                  key={entry.id}
                  className="p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                  onClick={onClose}
                >
                  <p className="font-medium text-foreground">{entry.title}</p>
                  <p className="text-sm text-[hsl(215,4%,56%)]">
                    {formatDate(entry.createdAt)}
                  </p>
                  <p className="text-sm text-[hsl(215,4%,56%)] mt-1 line-clamp-2">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
