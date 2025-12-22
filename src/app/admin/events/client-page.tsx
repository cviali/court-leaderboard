"use client";

import { EventList } from "@/app/event-list";
import { AddEventForm } from "@/app/add-event-form";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

export default function AdminEventsPage() {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <ResponsiveSheet
          open={open}
          onOpenChange={setOpen}
          title="Add Event"
          description="Create a new event for the leaderboard."
          trigger={
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">
                Add Event
              </span>
            </Button>
          }
        >
          <AddEventForm onSuccess={handleSuccess} />
        </ResponsiveSheet>
      </div>
      <EventList key={refreshKey} />
    </div>
  );
}
