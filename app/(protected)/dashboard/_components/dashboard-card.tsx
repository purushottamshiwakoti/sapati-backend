"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";

export const DashboardCard = ({
  className,
}: React.HTMLAttributes<HTMLDivElement>) => {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  return (
    <>
      <div
        className={cn("md:flex items-center justify-between gap-2", className)}
      >
        <div>
          <h2 className="text-3xl font-bold tracking-wide">Dashboard</h2>
        </div>
        {/* <div className="md:flex md:space-x-4 space-y-4 md:space-y-0 mt-2 md:mt-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
              <div className="p-2">
                <PopoverClose asChild>
                  <Button className="w-full">Done</Button>
                </PopoverClose>
              </div>
            </PopoverContent>
          </Popover>
          <div>
            <Button className="w-full md:w-auto">Download</Button>
          </div>
        </div> */}
      </div>
    </>
  );
};
