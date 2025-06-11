import { useState } from "react";
import Header from "@/components/header";
import StatsCards from "@/components/stats-cards";
import EntryCard from "@/components/entry-card";
import EntryModal from "@/components/entry-modal";
import SearchOverlay from "@/components/search-overlay";
import CalendarOverlay from "@/components/calendar-overlay";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEntries } from "@/hooks/use-entries";

export default function Journal() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<number | null>(null);

  const { data: entries = [], isLoading } = useEntries();

  const handleCreateEntry = () => {
    setEditingEntry(null);
    setEntryModalOpen(true);
  };

  const handleEditEntry = (id: number) => {
    setEditingEntry(id);
    setEntryModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(210,20%,96%)]">
      <Header
        onSearchToggle={() => setSearchOpen(!searchOpen)}
        onCalendarToggle={() => setCalendarOpen(!calendarOpen)}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards entries={entries} />

        <div className="space-y-6">
          {/* Today's Entry Prompt */}
          <div
            className="bg-card rounded-xl p-6 apple-shadow border-2 border-dashed border-gray-200 hover:border-[hsl(207,90%,54%)] transition-colors cursor-pointer"
            onClick={handleCreateEntry}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-[hsl(207,90%,54%)] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="text-[hsl(207,90%,54%)] text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Start today's entry
              </h3>
              <p className="text-[hsl(215,4%,56%)]">What's on your mind today?</p>
            </div>
          </div>

          {/* Entries List */}
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl p-6 apple-shadow animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[hsl(215,4%,56%)] text-lg">
                No entries yet. Start your journaling journey today!
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => handleEditEntry(entry.id)}
              />
            ))
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-[hsl(207,90%,54%)] hover:bg-[hsl(207,90%,48%)] shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={handleCreateEntry}
        >
          <Plus className="text-xl" />
        </Button>
      </div>

      {/* Overlays and Modals */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CalendarOverlay
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        entries={entries}
      />
      <EntryModal
        open={entryModalOpen}
        onClose={() => setEntryModalOpen(false)}
        editingId={editingEntry}
      />
    </div>
  );
}
