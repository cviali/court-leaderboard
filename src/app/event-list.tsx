"use client";

import { useEffect, useState, useMemo } from "react";
import { Event } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/constants";

export function EventList({ mode = "full" }: { mode?: "full" | "compact" }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const fetchEvents = () => {
    setIsLoading(true);
    fetch(`${API_URL}/events`)
      .then((res) => res.json())
      .then((data) => {
        // Sort events by start date
        const sorted = (data as Event[]).sort((a, b) => 
          new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
        );
        setEvents(sorted);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();

    // Update current time every 30 seconds to refresh status
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const columns = useMemo<ColumnDef<Event>[]>(() => [
    {
      accessorKey: "name",
      header: "Event Name",
      cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "startDateTime",
      header: "Start",
      cell: ({ row }) => {
        return format(new Date(row.getValue("startDateTime")), "MMM d, HH:mm");
      },
    },
    {
      accessorKey: "endDateTime",
      header: "End",
      cell: ({ row }) => {
        return format(new Date(row.getValue("endDateTime")), "MMM d, HH:mm");
      },
    },
    {
      accessorKey: "organizer",
      header: "Organizer",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const start = new Date(row.getValue("startDateTime"));
        const end = new Date(row.getValue("endDateTime"));
        
        if (now >= start && now <= end) {
          return <span className="text-green-600 font-bold px-2 py-1 bg-green-100 rounded-full text-xs">Active</span>;
        } else if (now < start) {
          return <span className="text-blue-600 font-bold px-2 py-1 bg-blue-100 rounded-full text-xs">Upcoming</span>;
        } else {
          return <span className="text-gray-500 font-bold px-2 py-1 bg-gray-100 rounded-full text-xs">Past</span>;
        }
      },
    },
  ], [now]);

  if (isLoading) {
    return <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>;
  }

  const renderSchedule = () => {
    // Group events by date
    const groupedEvents: { [key: string]: Event[] } = {};
    events.forEach(event => {
      const dateKey = format(new Date(event.startDateTime), "yyyy-MM-dd");
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }
      groupedEvents[dateKey].push(event);
    });

    const sortedDates = Object.keys(groupedEvents).sort();

    if (sortedDates.length === 0) {
      return <div className="text-center text-muted-foreground py-8">No upcoming events</div>;
    }

    return (
      <div className="space-y-6">
        {sortedDates.map(dateKey => {
          const dateEvents = groupedEvents[dateKey];
          const dateObj = new Date(dateKey);
          const isToday = isSameDay(dateObj, new Date());
          
          return (
            <div key={dateKey} className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-[#32574C]/10">
                <h3 className={cn("font-bold text-[#32574C]", isToday ? "text-amber-600" : "")}>
                  {isToday ? "Today" : format(dateObj, "EEEE")}
                </h3>
                <span className="text-sm text-muted-foreground font-medium">
                  {format(dateObj, "MMM d")}
                </span>
              </div>
              
              <div className="space-y-2">
                {dateEvents.map(event => {
                  const start = new Date(event.startDateTime);
                  const end = new Date(event.endDateTime);
                  
                  let status = "Past";
                  let statusColor = "text-gray-400 bg-gray-50 border-gray-200";
                  let dotColor = "bg-gray-400";
                  
                  if (now >= start && now <= end) {
                    status = "Live";
                    statusColor = "text-green-700 bg-green-50 border-green-200";
                    dotColor = "bg-green-500 animate-pulse";
                  } else if (now < start) {
                    status = format(start, "HH:mm");
                    statusColor = "text-[#32574C] bg-white border-transparent";
                    dotColor = "bg-[#32574C]";
                  }

                  return (
                    <div key={event.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 border border-transparent hover:border-[#32574C]/10">
                      {/* Time Column */}
                      <div className="flex flex-col items-center justify-center w-14 shrink-0">
                        <span className="text-sm font-bold text-[#32574C]">
                          {format(start, "HH:mm")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(end, "HH:mm")}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className={cn("w-1 h-8 rounded-full shrink-0", dotColor)} />

                      {/* Event Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#32574C] truncate text-sm leading-tight">
                          {event.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1 truncate">
                            <User className="w-3 h-3" />
                            {event.organizer}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {now >= start && (
                        <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0", statusColor)}>
                          {status}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (mode === "compact") {
    return renderSchedule();
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTable columns={columns} data={events} />
      </div>
      <div className="md:hidden">
        {renderSchedule()}
      </div>
    </>
  );
}
