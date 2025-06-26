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
import Toolbar from "@/components/tool-bar";

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
    <div
      className={`relative h-screen w-full origin-top overflow-hidden transition-all duration-300 ease-in-out ${entryModalOpen ? "translate-y-10 scale-90 rounded-lg" : ""}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 z-20 bg-gray-500 transition-all duration-300 ${entryModalOpen ? "bg-opacity-50" : "bg-opacity-0"}`}
      ></div>
      <div
        className={`flex h-full flex-col overflow-y-auto bg-[rgb(247,245,244)]`}
      >
        <Toolbar
          onSearchToggle={() => setSearchOpen(!searchOpen)}
          onCalendarToggle={() => setCalendarOpen(!calendarOpen)}
        />
        <Header
          onSearchToggle={() => setSearchOpen(!searchOpen)}
          onCalendarToggle={() => setCalendarOpen(!calendarOpen)}
        />

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <StatsCards entries={entries} />

          <div className="space-y-6">
            {/* Today's Entry Prompt */}
            <div
              className="apple-shadow cursor-pointer rounded-xl border-2 border-dashed border-gray-200 bg-card p-6 transition-colors hover:border-[hsl(207,90%,54%)]"
              onClick={handleCreateEntry}
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(207,90%,54%)] bg-opacity-10">
                  <Plus className="text-2xl text-[hsl(207,90%,54%)]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Start today's entry
                </h3>
                <p className="text-[hsl(215,4%,56%)]">
                  What's on your mind today?
                </p>
              </div>
            </div>

            {/* Entries List */}
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="apple-shadow animate-pulse rounded-xl bg-card p-6"
                  >
                    <div className="mb-4 h-6 rounded bg-gray-200"></div>
                    <div className="mb-2 h-4 rounded bg-gray-200"></div>
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="py-12 text-center">
                {Array.from({ length: 10 }).map((_, index) => (
                  <p className="text-lg text-[hsl(215,4%,56%)]">
                    No entries yet. Start your journaling journey today!
                  </p>
                ))}
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
            className="h-14 w-14 rounded-full bg-[hsl(207,90%,54%)] shadow-lg transition-all duration-200 hover:bg-[hsl(207,90%,48%)] hover:shadow-xl"
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
    </div>
  );
}
