import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Entry } from "@shared/schema";

interface CalendarOverlayProps {
  open: boolean;
  onClose: () => void;
  entries: Entry[];
}

export default function CalendarOverlay({ open, onClose, entries }: CalendarOverlayProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasEntryOnDate = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return entries.some(entry => {
      const entryDate = new Date(entry.createdAt);
      return (
        entryDate.getDate() === day &&
        entryDate.getMonth() === currentDate.getMonth() &&
        entryDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">Browse Entries</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4">
          <div className="text-center mb-4">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4 text-[hsl(215,4%,56%)]" />
              </Button>
              <h4 className="text-lg font-medium text-foreground">{monthName}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-muted"
              >
                <ChevronRight className="w-4 h-4 text-[hsl(215,4%,56%)]" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-xs font-medium text-[hsl(215,4%,56%)]">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month start */}
            {emptyDays.map(day => (
              <div key={`empty-${day}`} className="p-2"></div>
            ))}

            {/* Days of the month */}
            {days.map(day => (
              <div
                key={day}
                className={`
                  p-2 text-sm cursor-pointer rounded-lg relative transition-colors
                  ${isToday(day)
                    ? 'bg-[hsl(207,90%,54%)] text-white'
                    : 'text-foreground hover:bg-[hsl(207,90%,54%)] hover:text-white'
                  }
                `}
              >
                {day}
                {hasEntryOnDate(day) && (
                  <div className="w-1 h-1 bg-[hsl(142,71%,45%)] rounded-full absolute bottom-1 left-1/2 transform -translate-x-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
