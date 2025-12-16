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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const fetchPlayers = (pageNum: number, reset = pageNum === 1) => {
    setIsLoading(true);
    fetch(`/api/players?page=${pageNum}&limit=${LIMIT}`)
      .then((res) => res.json())
      .then((resData) => {
        const data = resData as Player[];
        if (data.length < LIMIT) {
          setHasMore(false);
        }
        setPlayers((prev) => reset ? data : [...prev, ...data]);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchPlayers(1, true);
  }, []);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPlayers(nextPage);
    }
  };

  const columns: ColumnDef<Player>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const player = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={player.avatarUrl || undefined} alt={player.name} />
              <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>{player.name}</span>
          </div>
        );
      },
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
      accessorKey: "instagramHandle",
      header: "Instagram",
      cell: ({ row }) => {
        const handle = row.getValue("instagramHandle") as string | null;
        return handle ? <span>{handle}</span> : <span className="text-muted-foreground">-</span>;
      },
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

  if (isLoading && players.length === 0) {
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
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <DataTable columns={columns} data={players} />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {players.map((player) => (
          <div
            key={player.id}
            className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer"
            onClick={() => {
              setEditingPlayer(player);
              setIsEditOpen(true);
            }}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={player.avatarUrl || undefined} alt={player.name} />
              <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate">{player.name}</h3>
                <span className="font-bold text-primary">{player.points} pts</span>
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {player.instagramHandle || "No Instagram"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Last match: {player.lastMatchAt ? new Date(player.lastMatchAt).toLocaleDateString() : "-"}
              </div>
            </div>
          </div>
        ))}
        
        {hasMore && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        )}
      </div>

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
              setPage(1);
              setHasMore(true);
              fetchPlayers(1, true);
            }}
          />
        </ResponsiveSheet>
      )}
    </>
  );
}
