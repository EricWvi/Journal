import React from "react";
import {
  Calendar,
  Description,
  Entries,
  Icon,
  Number,
  Quote,
  VerticalBar,
} from "@/components/ui/stats-icon";

const Stats = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="mr-4 flex flex-col">
        <div className="flex items-center leading-none">
          <Icon className="mr-[6px] ml-[2px] h-4 w-4">
            <Entries />
          </Icon>
          <Number>12</Number>
        </div>
        <Description>Entries This Year</Description>
      </div>

      <VerticalBar className="h-6" />

      <div className="mr-4 flex flex-col">
        <div className="flex items-center leading-none">
          <Icon className="mr-[6px] ml-[2px] h-4 w-4">
            <Quote />
          </Icon>
          <Number>3,658</Number>
        </div>
        <Description>Words Written</Description>
      </div>

      <VerticalBar className="h-6" />

      <div className="mr-4 flex flex-col">
        <div className="flex items-center leading-none">
          <Icon className="mr-[6px] ml-[2px] h-4 w-4">
            <Calendar />
          </Icon>
          <Number>78</Number>
        </div>
        <Description>Days Journaled</Description>
      </div>
    </div>
  );
};

export default Stats;
