"use client";

import { MatchList } from "@/app/match-list";
import { AddMatchForm } from "@/app/add-match-form";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

export default function AdminMatchesPage() {
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
          title="Record Match"
          description="Record a new match result."
          trigger={
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">
                Record Match
              </span>
            </Button>
          }
        >
          <AddMatchForm onSuccess={handleSuccess} />
        </ResponsiveSheet>
      </div>
      <MatchList key={refreshKey} />
    </div>
  );
}
