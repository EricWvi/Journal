import { Calendar, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onSearchToggle: () => void;
  onCalendarToggle: () => void;
}

export default function Header({ onSearchToggle, onCalendarToggle }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 apple-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-foreground">Journal</h1>
            <div className="hidden md:flex items-center space-x-2 text-[hsl(215,4%,56%)] text-sm">
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
              className="p-2 text-[hsl(215,4%,56%)] hover:text-foreground"
            >
              <Search className="text-lg" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onCalendarToggle}
              className="p-2 text-[hsl(215,4%,56%)] hover:text-foreground"
            >
              <Calendar className="text-lg" />
            </Button>

            <div className="w-8 h-8 bg-[hsl(207,90%,54%)] rounded-full flex items-center justify-center">
              <User className="text-white text-sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
