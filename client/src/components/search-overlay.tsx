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
    queryKey: ["/api/entry/search", query],
    enabled: query.length > 2,
    queryFn: async () => {
      if (query.length <= 2) return [];
      const response = await fetch(
        `/api/entry/search/${encodeURIComponent(query)}`,
      );
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
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <div className="border-border border-b p-4">
          <div className="flex items-center space-x-3">
            <Search className="text-[hsl(215,4%,56%)]" />
            <Input
              placeholder="Search your journal entries..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-none bg-transparent text-lg outline-hidden focus-visible:ring-0"
              autoFocus
            />
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-4">
          {query.length <= 2 ? (
            <p className="py-8 text-center text-[hsl(215,4%,56%)]">
              Type at least 3 characters to search
            </p>
          ) : searchResults.length === 0 ? (
            <p className="py-8 text-center text-[hsl(215,4%,56%)]">
              No entries found for "{query}"
            </p>
          ) : (
            <div className="space-y-3">
              {searchResults.map((entry: any) => (
                <div
                  key={entry.id}
                  className="hover:bg-muted cursor-pointer rounded-lg p-3 transition-colors"
                  onClick={onClose}
                >
                  <p className="text-foreground font-medium">{entry.title}</p>
                  <p className="text-sm text-[hsl(215,4%,56%)]">
                    {formatDate(entry.createdAt)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-[hsl(215,4%,56%)]">
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
