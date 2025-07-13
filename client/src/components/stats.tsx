import React from "react";
import {
  CalendarIcon,
  EntriesIcon,
  QuoteIcon,
} from "@/components/ui/stats-icon";

// Demo component showing all icons
const JournalingIcons = () => {
  return (
    <>
      <EntriesIcon className="h-6 w-6"></EntriesIcon>
      <QuoteIcon className="h-6 w-6"></QuoteIcon>
      <CalendarIcon className="h-6 w-6"></CalendarIcon>
    </>
  );
};

export default JournalingIcons;
