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
  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    const container = document.querySelector("#scrollableDiv");
    if (!container) return;

    const handleScroll = () => {
      const scrollY = (container as HTMLElement).scrollTop;
      if (scrollY <= 20) {
        setOpacity(0);
      } else if (scrollY >= 100) {
        setOpacity(1);
      } else {
        const ratio = (scrollY - 20) / (100 - 20);
        setOpacity(ratio);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 h-auto w-full shrink-0 bg-zinc-50/80 shadow-md backdrop-blur-lg transition-opacity duration-300 ${opacity > 0.4 ? "" : "pointer-events-none"}`}
      style={{ opacity }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-10 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-foreground text-xl font-semibold">Journal</h1>
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
