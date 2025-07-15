import { Edit, Heart, MoreHorizontal, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NodeType } from "@/lib/html-parse";
import { emojiClassName } from "./emoji-picker";
import { EntryMeta, useEntry } from "@/hooks/use-entries";
import { ImageList } from "@/components/ui/image-list";
import { useEffect, useRef, useState } from "react";

const monthToText = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface EntryCardProps {
  meta: EntryMeta;
  showYear: boolean;
  showMonth: boolean;
  showToday: boolean;
  showYes: boolean;
  showTime: boolean;
  onEdit: () => void;
}

export default function EntryCard({
  meta,
  showYear,
  showMonth,
  showToday,
  showYes,
  showTime,
  onEdit,
}: EntryCardProps) {
  const { data: entry, isLoading } = useEntry(meta.id);
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.maxHeight = expanded
        ? cardRef.current.scrollHeight + "px"
        : "72px";
    }
  }, [expanded]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <>
      {!isLoading && entry && (
        <>
          {showMonth && (
            <h3 className="text-foreground mt-6 mb-2 ml-1 text-xl leading-none font-semibold">
              {monthToText[meta.month - 1]}
              {showYear && ", " + meta.year}
            </h3>
          )}
          {showToday && (
            <h3 className="text-foreground mt-6 mb-2 ml-1 text-xl leading-none font-semibold">
              Today
            </h3>
          )}
          {showYes && (
            <h3 className="text-foreground mt-6 mb-2 ml-1 text-xl leading-none font-semibold">
              Yesterday
            </h3>
          )}
          <div className="entry-card-shadow bg-entry-card mb-4 flex flex-col overflow-hidden rounded-lg transition-shadow hover:shadow-md">
            {/* TODO picture loading css animation */}
            <div className="my-1 px-1">
              <ImageList
                imgSrc={entry.content
                  .filter((node) => node.type === NodeType.IMAGE)
                  .map((node) => node.content as string)}
              />
            </div>
            <div
              ref={cardRef}
              className={`my-3 overflow-hidden px-4 transition-all duration-500 ease-in-out`}
              onClick={() => setExpanded(!expanded)}
            >
              <div className="text-foreground text-lg leading-6 font-normal">
                {entry.content
                  .filter((node) => node.type !== NodeType.IMAGE)
                  .map((node, index) => {
                    switch (node.type) {
                      case NodeType.TEXT:
                        return <span key={index}>{node.content}</span>;
                      case NodeType.BREAK:
                        return <br key={index} />;
                      case NodeType.EMOJI:
                        return (
                          <span
                            key={index}
                            draggable={false}
                            contentEditable={false}
                            className={emojiClassName(node.content ?? "")}
                          ></span>
                        );
                      default:
                        return <></>;
                    }
                  })}
              </div>
            </div>

            <div className="border-border mx-1 flex items-center justify-between border-t px-3 py-1">
              <div className="flex-1">
                <div className="flex items-center space-x-4 text-sm text-[hsl(215,4%,56%)]">
                  <span>{formatDate(entry.createdAt)}</span>
                  {showTime && <span>{formatTime(entry.createdAt)}</span>}
                </div>
              </div>
              <div className="flex items-center space-x-2">12</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
