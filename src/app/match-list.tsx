"use client";

import { useEffect, useState } from "react";
import { Match, Player, Court } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from "@/lib/constants";

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

import { Button } from "@/components/ui/button";
import { Trophy, XCircle, MapPin, Calendar } from "lucide-react";

// ... existing code ...

export function MatchList() {
  const [matches, setMatches] = useState<MatchWithNames[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  // Cache players and courts to avoid refetching on every page load
  const [playersMap, setPlayersMap] = useState<Map<number, string>>(new Map());
  const [courtsMap, setCourtsMap] = useState<Map<number, string>>(new Map());

  const fetchMatches = async (pageNum: number, reset = pageNum === 1) => {
    setIsLoading(true);
    
    // Fetch metadata only once
    if (playersMap.size === 0 || courtsMap.size === 0) {
      const [playersData, courtsData] = await Promise.all([
        fetch(`${API_URL}/players`).then((res) => res.json()),
        fetch(`${API_URL}/courts`).then((res) => res.json()),
      ]);
      
      const pMap = new Map((playersData as Player[]).map((p) => [p.id, p.name]));
      const cMap = new Map((courtsData as Court[]).map((c) => [c.id, c.name]));
      
      setPlayersMap(pMap);
      setCourtsMap(cMap);
      
      // Now fetch matches
      fetchMatchesData(pageNum, LIMIT, pMap, cMap, reset);
    } else {
      fetchMatchesData(pageNum, LIMIT, playersMap, courtsMap, reset);
    }
  };

  const fetchMatchesData = (pageNum: number, limit: number, pMap: Map<number, string>, cMap: Map<number, string>, reset: boolean) => {
    fetch(`${API_URL}/matches?page=${pageNum}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        const matchesData = data as Match[];
        if (matchesData.length < limit) {
          setHasMore(false);
        }

        const matchesWithNames = matchesData.map((match) => ({
          ...match,
          winnerName: pMap.get(match.winnerId) || "Unknown",
          loserName: pMap.get(match.loserId) || "Unknown",
          courtName: match.courtId ? cMap.get(match.courtId) : "Unknown",
        }));

        setMatches((prev) => reset ? matchesWithNames : [...prev, ...matchesWithNames]);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchMatches(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMatches(nextPage);
    }
  };

  if (isLoading && matches.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
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
        <DataTable columns={columns} data={matches} />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white p-4 rounded-lg shadow-sm border space-y-3"
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(match.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{match.courtName}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 flex flex-col items-center p-2 bg-green-50 rounded-md border border-green-100">
                <span className="text-xs font-semibold text-green-600 uppercase mb-1">Winner</span>
                <span className="font-bold text-green-800 text-center truncate w-full">{match.winnerName}</span>
                <Trophy className="w-4 h-4 text-green-500 mt-1" />
              </div>
              
              <div className="text-sm font-bold text-muted-foreground">VS</div>
              
              <div className="flex-1 flex flex-col items-center p-2 bg-red-50 rounded-md border border-red-100">
                <span className="text-xs font-semibold text-red-600 uppercase mb-1">Loser</span>
                <span className="font-bold text-red-800 text-center truncate w-full">{match.loserName}</span>
                <XCircle className="w-4 h-4 text-red-400 mt-1" />
              </div>
            </div>
            
            <div className="text-center">
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                {match.sport}
              </span>
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
    </>
  );
}
