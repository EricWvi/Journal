import { useEffect, useState } from "react";
import Header from "@/components/header";
import EntryCard from "@/components/entry-card";
import EntryModal from "@/components/entry-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  EntryMeta,
  QueryCondition,
  useDraft,
  useEntries,
} from "@/hooks/use-entries";
import Toolbar from "@/components/tool-bar";
import InfiniteScroll from "react-infinite-scroll-component";
import { useQueryClient } from "@tanstack/react-query";

export default function Journal() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<number>(0);

  const queryClient = useQueryClient();
  const [entries, setEntries] = useState<EntryMeta[]>([]);
  const [condition, setCondition] = useState<QueryCondition[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const refresh = () => {
    setEntries([]);
    setPage(0);
    setHasMore(true);
    loadInitialData();
  };

  const setQueryFn = (key: (string | number)[], data: any) => {
    queryClient.setQueryData(key, data);
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [metas, hasMore] = await useEntries(1, condition, setQueryFn);
      setEntries(metas);
      setHasMore(hasMore);
      setPage(2);
    } catch (err) {
      console.error("Error loading initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreData = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const [metas, hasMore] = await useEntries(page, condition, setQueryFn);
      setEntries((prev) => [...prev, ...metas]);
      setHasMore(hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Error fetching more data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    const draft = await useDraft();
    setEditingEntry(draft);
    setEntryModalOpen(true);
  };

  const handleEditEntry = (id: number) => {
    setEditingEntry(id);
    setEntryModalOpen(true);
  };

  const handleEntryModalClose = () => {
    setEntryModalOpen(false);
    setEditingEntry(0);
  };

  return (
    <div
      className={`relative h-screen w-full origin-top transition-all duration-300 ease-in-out ${entryModalOpen ? "translate-y-10 scale-90 rounded-lg" : ""}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 z-20 transition-all duration-300 ${entryModalOpen ? "bg-gray-500/50" : "bg-gray-500/0"}`}
      ></div>
      <div
        id="scrollableDiv"
        className={`bg-background dark:bg-background flex h-full flex-col overflow-y-auto ${entryModalOpen ? "rounded-lg" : ""}`}
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
          {/* <StatsCards entries={entries} /> */}

          <div className="space-y-6">
            {/* Entries List */}
            <InfiniteScroll
              scrollableTarget="scrollableDiv"
              dataLength={entries.length}
              next={fetchMoreData}
              hasMore={hasMore}
              loader={
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="apple-shadow bg-card animate-pulse rounded-xl p-6"
                    >
                      <div className="mb-4 h-6 rounded bg-gray-200"></div>
                      <div className="mb-2 h-4 rounded bg-gray-200"></div>
                      <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              }
              endMessage={
                <div className="py-12 text-center">
                  <p className="text-lg text-[hsl(215,4%,56%)]">
                    {entries.length === 0
                      ? "No entries yet. Start your journaling journey today!"
                      : "- end -"}
                  </p>
                </div>
              }
            >
              {/* Entry Cards */}
              {entries
                .map((entry, idx, arr) => {
                  const prev = arr[idx - 1];
                  const next = arr[idx + 1];
                  const showYear = !prev || entry.year !== prev.year;
                  const showMonth =
                    !prev ||
                    entry.year !== prev.year ||
                    entry.month !== prev.month;
                  const showTime =
                    (prev &&
                      entry.year === prev.year &&
                      entry.month === prev.month &&
                      entry.day === prev.day) ||
                    (next &&
                      entry.year === next.year &&
                      entry.month === next.month &&
                      entry.day === next.day);
                  return {
                    entry,
                    showYear,
                    showMonth,
                    showTime,
                  };
                })
                .map(({ entry, showYear, showMonth, showTime }) => (
                  <EntryCard
                    key={entry.id}
                    meta={entry}
                    showYear={showYear}
                    showMonth={showMonth}
                    showTime={showTime}
                    onEdit={() => handleEditEntry(entry.id)}
                  />
                ))}
            </InfiniteScroll>
          </div>
        </main>

        {/* Floating Action Button */}
        <div className="fixed right-6 bottom-6 z-40">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-[hsl(207,90%,54%)] shadow-lg transition-all duration-200 hover:bg-[hsl(207,90%,48%)] hover:shadow-xl"
            onClick={handleCreateEntry}
          >
            <Plus className="text-xl" />
          </Button>
        </div>

        {/* Overlays and Modals */}
        {/* <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} /> */}
        {/* <CalendarOverlay
          open={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          entries={entries}
        /> */}
        {editingEntry !== 0 && (
          <EntryModal
            open={entryModalOpen}
            onClose={handleEntryModalClose}
            entryId={editingEntry}
            refresh={refresh}
          />
        )}
      </div>
    </div>
  );
}
