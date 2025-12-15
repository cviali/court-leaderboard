"use client";

import { useEffect, useState } from "react";
import { Match, Player, Court } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";

type MatchWithNames = Match & {
  winnerName: string;
  loserName: string;
  courtName?: string;
};

const columns: ColumnDef<MatchWithNames>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    accessorKey: "winnerName",
    header: "Winner",
    cell: ({ row }) => {
      return (
        <span className="font-medium text-green-600">
          {row.getValue("winnerName")}
        </span>
      );
    },
  },
  {
    accessorKey: "loserName",
    header: "Loser",
    cell: ({ row }) => {
      return (
        <span className="text-red-600">{row.getValue("loserName")}</span>
      );
    },
  },
  {
    accessorKey: "sport",
    header: "Sport",
    cell: ({ row }) => {
      return <span className="capitalize">{row.getValue("sport")}</span>;
    },
  },
  {
    accessorKey: "courtName",
    header: "Court",
  },
];

export function MatchList() {
  const [matches, setMatches] = useState<MatchWithNames[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/matches").then((res) => res.json()),
      fetch("/api/players").then((res) => res.json()),
      fetch("/api/courts").then((res) => res.json()),
    ]).then(([matchesData, playersData, courtsData]) => {
      const playersMap = new Map(
        (playersData as Player[]).map((p) => [p.id, p.name])
      );
      const courtsMap = new Map(
        (courtsData as Court[]).map((c) => [c.id, c.name])
      );

      const matchesWithNames = (matchesData as Match[]).map((match) => ({
        ...match,
        winnerName: playersMap.get(match.winnerId) || "Unknown",
        loserName: playersMap.get(match.loserId) || "Unknown",
        courtName: match.courtId ? courtsMap.get(match.courtId) : "Unknown",
      }));

      setMatches(matchesWithNames);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
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
    <DataTable columns={columns} data={matches} />
  );
}
