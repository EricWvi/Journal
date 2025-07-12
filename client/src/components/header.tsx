import { Calendar, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  return (
    <header>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-foreground text-2xl font-semibold">Journal</h1>
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

            <Button
              variant="ghost"
              size="sm"
              onClick={onCalendarToggle}
              className="hover:text-foreground p-2 text-[hsl(215,4%,56%)]"
            >
              <Calendar className="text-lg" />
            </Button>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(207,90%,54%)]">
              <User className="text-sm text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
