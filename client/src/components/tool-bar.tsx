import { useEffect, useState } from "react";

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
      if (scrollY <= 80) {
        setOpacity(0);
      } else if (scrollY >= 100) {
        setOpacity(1);
      } else {
        const ratio = (scrollY - 80) / (100 - 80);
        setOpacity(ratio);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // backdrop-filter: saturate(180%) blur(20px);
  //       background-color: rgba(255, 255, 255, .72);

  return (
    <header
      className={`fixed top-0 z-50 h-auto w-full shrink-0 bg-zinc-50/80 shadow-md backdrop-blur-lg transition-opacity duration-300 ${opacity > 0.6 ? "" : "pointer-events-none"}`}
      style={{ opacity }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-10 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-foreground text-xl font-semibold">Journal</h1>
          </div>

          <div className="flex items-center space-x-4"></div>
        </div>
      </div>
    </header>
  );
}
