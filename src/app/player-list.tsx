"use client";

import { useEffect, useState } from "react";
import { Player } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { EditPlayerForm } from "./edit-player-form";

export function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlayers = () => {
    setIsLoading(true);
    fetch("/api/players")
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data as Player[]);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const columns: ColumnDef<Player>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "lastMatchAt",
      header: "Last Match",
      cell: ({ row }) => {
        const date = row.getValue("lastMatchAt");
        if (!date) return <span className="text-muted-foreground">-</span>;
        return new Date(date as string).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      accessorKey: "points",
      header: "Points",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const player = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setEditingPlayer(player);
                  setIsEditOpen(true);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    );
  }

  return (
    <>
      <DataTable columns={columns} data={players} />
      {editingPlayer && (
        <ResponsiveSheet
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          title="Edit Player"
          description="Update player details."
        >
          <EditPlayerForm
            player={editingPlayer}
            onSuccess={() => {
              setIsEditOpen(false);
              fetchPlayers();
            }}
          />
        </ResponsiveSheet>
      )}
    </>
  );
}
