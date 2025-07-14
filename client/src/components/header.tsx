import { Calendar as CalendarIcon, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import Stats from "@/components/stats";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface HeaderProps {
  onSearchToggle: () => void;
  onCalendarToggle: () => void;
}

export default function Header({
  onSearchToggle,
  onCalendarToggle,
}: HeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<{
    from: Date | undefined;
    to?: Date | undefined;
  }>({ from: undefined, to: undefined });

  const handleDateSelect = (
    range: { from: Date | undefined; to?: Date | undefined } | undefined,
  ) => {
    setDate(range ?? { from: undefined, to: undefined });
    setOpen(false);
  };

  return (
    <header>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-10 flex h-12 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-foreground text-3xl font-semibold">Journal</h1>
            <div className="hidden items-center space-x-2 text-sm text-[hsl(215,4%,56%)] md:flex">
              <span>Today</span>
              <span className="text-xs">•</span>
              <span>{currentDate}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearchToggle}
              className="hover:text-foreground p-2 text-[hsl(215,4%,56%)]"
            >
              <Search className="text-lg" />
            </Button>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  data-empty={!date}
                  className="hover:text-foreground p-2 text-[hsl(215,4%,56%)]"
                >
                  <CalendarIcon className="text-lg" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={handleDateSelect}
                />
              </PopoverContent>
            </Popover>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(207,90%,54%)]">
              <User className="text-sm text-white" />
            </div>
          </div>
        </div>

        <Stats />
      </div>
    </header>
  );
}
