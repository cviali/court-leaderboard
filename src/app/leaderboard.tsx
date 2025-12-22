"use client";

import { Player, Court } from "@/lib/types";
import { useEffect, useState } from "react";
import { Trophy, Medal, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EventList } from "./event-list";

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

interface LeaderboardProps {
  initialPlayers: Player[];
  initialCourts: Court[];
}

export function Leaderboard({ initialPlayers, initialCourts }: LeaderboardProps) {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [courts, setCourts] = useState<Court[]>(initialCourts);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setPlayers(initialPlayers);
    setCourts(initialCourts);
    setLastUpdated(new Date());
  }, [initialPlayers, initialCourts]);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000); // Refresh every 5 seconds (hits server cache)

    // Hard reload every 4 hours to prevent memory leaks on Smart TVs
    const hardReloadInterval = setInterval(() => {
      window.location.reload();
    }, 4 * 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(hardReloadInterval);
    };
  }, [router]);

  const enableFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Error attempting to enable fullscreen:", err);
      });
    }
  };

  return (
    <div 
      className="w-full max-w-7xl mx-auto space-y-4 p-4"
      onClick={enableFullscreen}
    >
      <div className="flex flex-col items-center mb-4">
        <Image
          src="/logo.png"
          alt="Court Leaderboard Logo"
          width={100}
          height={100}
          className="mb-2"
          style={{ width: "100px", height: "auto" }}
          priority
        />
        {lastUpdated && (
          <span className="text-xs text-muted-foreground font-medium">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-[#32574C]">Top Players</h2>
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
            {players.slice(0, 10).map((player, index) => {
              const rank = index + 1;
              
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  key={player.id}
                  className={cn(
                    "relative flex items-center justify-between p-3 rounded-xl border transition-colors duration-200 hover:shadow-md",
                    "bg-[#F9F6F4]",
                    rank === 1 ? "border-yellow-400/50 bg-gradient-to-r from-yellow-50/30 to-transparent" :
                    rank === 2 ? "border-gray-300/50 bg-gradient-to-r from-gray-50/30 to-transparent" :
                    rank === 3 ? "border-amber-600/30 bg-gradient-to-r from-amber-50/30 to-transparent" :
                    "border-transparent hover:border-[#32574C]/20 shadow-sm"
                  )}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-10 shrink-0">
                    {rank === 1 ? (
                      <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
                    ) : rank === 2 ? (
                      <Medal className="w-6 h-6 text-gray-400 fill-gray-400 drop-shadow-sm" />
                    ) : rank === 3 ? (
                      <Medal className="w-6 h-6 text-amber-600 fill-amber-600 drop-shadow-sm" />
                    ) : (
                      <span className="text-2xl font-black text-[#32574C]/30 font-mono">
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar & Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0 ml-2">
                    <div className="relative">
                      <Avatar className={cn(
                        "border-2",
                        rank === 1 ? "border-yellow-400 w-11 h-11" :
                        rank === 2 ? "border-gray-300 w-11 h-11" :
                        rank === 3 ? "border-amber-600 w-11 h-11" :
                        "border-transparent w-10 h-10"
                      )}>
                        <AvatarImage src={player.avatarUrl || undefined} alt={player.name} />
                        <AvatarFallback className="font-bold text-[#32574C] text-sm">
                          {player.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex flex-col min-w-0 gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#32574C] truncate text-base">
                          {player.name}
                        </span>
                        {player.instagramHandle && (
                          <>
                            <div className="h-3 w-[1px] bg-[#32574C]/20" />
                            <span className="text-xs font-medium text-[#32574C]/70 truncate">
                              {player.instagramHandle}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {player.lastCourtId ? (courts.find(c => c.id === player.lastCourtId)?.name || 'Unknown Court') : 'No recent match'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-end shrink-0 ml-3">
                    <span className="text-xl font-black text-[#32574C] tabular-nums leading-none">
                      <AnimatedNumber value={player.points} />
                    </span>
                    <span className="text-[10px] font-medium text-[#32574C]/60 uppercase tracking-wider mt-0.5">
                      Points
                    </span>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </div>
        </div>

        {/* Events Column */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#32574C]">Events</h2>
          <div className="bg-[#F9F6F4] rounded-2xl p-4 border border-[#32574C]/10 min-h-[500px]">
             <EventList mode="compact" />
          </div>
        </div>
      </div>
    </div>
  );
}
