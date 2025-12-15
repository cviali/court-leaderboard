"use client";

import { PlayerList } from "@/app/player-list";
import { AddPlayerForm } from "@/app/add-player-form";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

export default function AdminPlayersPage() {
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
          title="Add Player"
          description="Create a new player to add to the leaderboard."
          trigger={
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">
                Add Player
              </span>
            </Button>
          }
        >
          <AddPlayerForm onSuccess={handleSuccess} />
        </ResponsiveSheet>
      </div>
      <PlayerList key={refreshKey} />
    </div>
  );
}
