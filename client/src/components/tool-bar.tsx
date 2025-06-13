import { useEffect, useState } from "react";
import { Calendar, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onSearchToggle: () => void;
  onCalendarToggle: () => void;
}

export default function Toolbar({
  onSearchToggle,
  onCalendarToggle,
}: HeaderProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsMinimized(scrollY > 20);
      if (scrollY <= 20) {
        setOpacity(0);
      } else if (scrollY >= 100) {
        setOpacity(1);
      } else {
        const ratio = (scrollY - 20) / (100 - 20);
        setOpacity(ratio);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 z-50 h-auto w-full shrink-0 bg-zinc-50 bg-opacity-80 shadow-md backdrop-blur-lg"
      style={{ opacity }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-8 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-foreground">Journal</h1>
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

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(207,90%,54%)]">
              <User className="text-sm text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
