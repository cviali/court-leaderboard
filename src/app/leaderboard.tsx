"use client";

import { Player, Court } from "@/lib/types";
import { useEffect, useState } from "react";
import { Trophy, Medal, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface LeaderboardProps {
  initialPlayers: Player[];
  initialCourts: Court[];
}

export function Leaderboard({ initialPlayers, initialCourts }: LeaderboardProps) {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [courts, setCourts] = useState<Court[]>(initialCourts);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());

  useEffect(() => {
    setPlayers(initialPlayers);
    setCourts(initialCourts);
    setLastUpdated(new Date());
  }, [initialPlayers, initialCourts]);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000); // Refresh every 10 seconds (hits server cache)

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="flex flex-col items-center mb-4">
        <Image
          src="/logo.png"
          alt="Court Leaderboard Logo"
          width={120}
          height={120}
          className="mb-4"
          style={{ width: "120px", height: "auto" }}
          priority
        />
        {lastUpdated && (
          <span className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#32574C] text-white rounded-xl shadow-md">
        <div className="font-bold text-sm tracking-widest uppercase w-12 text-center">Rank</div>
        <div className="font-bold text-sm tracking-widest uppercase flex-1 px-6">Player</div>
        <div className="font-bold text-sm tracking-widest uppercase text-right w-24">Points</div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {players.map((player, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;
          
          return (
            <div 
              key={player.id}
              className={cn(
                "relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] hover:shadow-md",
                "bg-white",
                rank === 1 ? "border-yellow-400/50 bg-gradient-to-r from-yellow-50/50 to-transparent" :
                rank === 2 ? "border-gray-300/50 bg-gradient-to-r from-gray-50/50 to-transparent" :
                rank === 3 ? "border-amber-600/30 bg-gradient-to-r from-amber-50/50 to-transparent" :
                "border-transparent hover:border-[#32574C]/10"
              )}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-12 shrink-0">
                {rank === 1 ? (
                  <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
                ) : rank === 2 ? (
                  <Medal className="w-7 h-7 text-gray-400 fill-gray-400 drop-shadow-sm" />
                ) : rank === 3 ? (
                  <Medal className="w-7 h-7 text-amber-600 fill-amber-600 drop-shadow-sm" />
                ) : (
                  <span className="text-xl font-bold text-[#32574C]/40 font-mono">
                    {String(rank).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Player Info */}
              <div className="flex-1 px-6 min-w-0">
                <div className="flex flex-col">
                  <span className={cn(
                    "text-lg font-bold truncate tracking-tight",
                    isTop3 ? "text-[#32574C]" : "text-[#82644f]"
                  )}>
                    {player.name}
                  </span>
                  {player.lastMatchAt && (
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium text-[#82644f]/60 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(player.lastMatchAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                      {player.lastCourtId && courts.find((c) => c.id === player.lastCourtId) && (
                        <>
                          <span className="mx-1">•</span>
                          <MapPin className="w-3 h-3" />
                          <span>{courts.find((c) => c.id === player.lastCourtId)?.name}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Points */}
              <div className="flex items-center justify-end w-24">
                <div className="flex flex-col items-end leading-none">
                  <span className={cn(
                    "text-3xl font-black tracking-tighter",
                    "text-[#32574C]"
                  )}>
                    {player.points}
                  </span>
                  <span className="text-[10px] font-bold text-[#32574C]/40 uppercase tracking-widest mt-1">PTS</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
