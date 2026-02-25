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
import { getImageUrl } from "@/lib/constants";

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
  const [page, setPage] = useState(0); // 0 = ranks 1-5, 1 = ranks 6-10

  useEffect(() => {
    setPlayers(initialPlayers);
    setCourts(initialCourts);
    setLastUpdated(new Date());
  }, [initialPlayers, initialCourts]);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000); // Refresh every 5 seconds (hits server cache)

    const rotationInterval = setInterval(() => {
      setPage((prevPage) => (prevPage === 0 ? 1 : 0));
    }, 10000); // Rotate every 10 seconds

    // Hard reload every 4 hours to prevent memory leaks on Smart TVs
    const hardReloadInterval = setInterval(() => {
      window.location.reload();
    }, 4 * 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(rotationInterval);
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

  const displayedPlayers = page === 0 ? players.slice(0, 5) : players.slice(5, 10);

  return (
    <div 
      className="w-full h-screen overflow-hidden flex flex-col p-6 bg-[#EFE9E4]"
      onClick={enableFullscreen}
    >
      <div className="flex items-center mb-6 gap-6 justify-center shrink-0">
        <Image
          src="/logo.png"
          alt="Court Leaderboard Logo"
          width={80}
          height={80}
          style={{ width: "80px", height: "auto" }}
          priority
        />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-[#32574C]">Leaderboard</h1>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground font-medium">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
        {/* Leaderboard Column */}
        <div className="col-span-2 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 shrink-0 px-2">
            <h2 className="text-2xl font-bold text-[#32574C]">
              {page === 0 ? "Top 5 Players" : "Players Ranked 6 - 10"}
            </h2>
            <div className="flex gap-1">
              <div className={cn("w-2 h-2 rounded-full", page === 0 ? "bg-[#32574C]" : "bg-[#32574C]/20")} />
              <div className={cn("w-2 h-2 rounded-full", page === 1 ? "bg-[#32574C]" : "bg-[#32574C]/20")} />
            </div>
          </div>
          
          <div className="flex-1 min-h-0 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-3 h-full pb-4"
              >
                {displayedPlayers.map((player, index) => {
                  const rank = (page * 5) + index + 1;
                  
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      key={player.id}
                      className={cn(
                        "relative flex items-center justify-between p-3 rounded-xl border transition-colors duration-200",
                        "bg-[#F9F6F4]",
                        rank === 1 ? "border-yellow-400/50 bg-gradient-to-r from-yellow-50/30 to-transparent" :
                        rank === 2 ? "border-gray-300/50 bg-gradient-to-r from-gray-50/30 to-transparent" :
                        rank === 3 ? "border-amber-600/30 bg-gradient-to-r from-amber-50/30 to-transparent" :
                        "border-transparent hover:border-[#32574C]/20 shadow-sm"
                      )}
                      style={{ height: "calc(20% - 12px)" }}
                    >
                      {/* Rank Indicator */}
                      <div className="flex items-center justify-center w-16 shrink-0">
                        {rank === 1 ? (
                          <div className="relative">
                            <Trophy className="w-10 h-10 text-yellow-500 fill-yellow-500 drop-shadow-md" />
                            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#32574C] text-[10px] font-bold text-white">1</span>
                          </div>
                        ) : rank === 2 ? (
                          <div className="relative">
                            <Medal className="w-10 h-10 text-gray-400 fill-gray-400 drop-shadow-md" />
                            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#32574C] text-[10px] font-bold text-white">2</span>
                          </div>
                        ) : rank === 3 ? (
                          <div className="relative">
                            <Medal className="w-10 h-10 text-amber-600 fill-amber-600 drop-shadow-md" />
                            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#32574C] text-[10px] font-bold text-white">3</span>
                          </div>
                        ) : (
                          <span className="text-2xl font-black text-[#32574C]/30 font-mono">
                            {rank}
                          </span>
                        )}
                      </div>

                      {/* Player Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0 ml-4">
                        <div className="relative">
                          <Avatar className={cn(
                            "border-2 transition-all duration-300",
                            rank === 1 ? "border-yellow-400 w-14 h-14" :
                            rank === 2 ? "border-gray-300 w-14 h-14" :
                            rank === 3 ? "border-amber-600 w-14 h-14" :
                            "border-[#32574C]/10 w-14 h-14"
                          )}>
                            <AvatarImage src={getImageUrl(player.avatarUrl)} alt={player.name} className="object-cover" />
                            <AvatarFallback className="font-bold text-[#32574C] text-xl">
                              {player.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex flex-col min-w-0 gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#32574C] truncate text-xl">
                              {player.name}
                            </span>
                            {player.instagramHandle && (
                              <span className="text-xs font-medium text-[#32574C]/70 truncate">
                                {player.instagramHandle}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate">
                                {player.lastCourtId ? (courts.find(c => c.id === player.lastCourtId)?.name || 'Unknown Court') : 'No recent match'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Points Display */}
                      <div className="flex flex-col items-end shrink-0 ml-4 pr-2">
                        <span className="text-2xl font-black text-[#32574C] tabular-nums leading-none">
                          <AnimatedNumber value={player.points} />
                        </span>
                        <span className="text-[10px] font-medium text-[#32574C]/60 uppercase tracking-wider mt-0.5">
                          Points
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Events Column */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-[#32574C] mb-4 shrink-0">
            Upcoming Events
          </h2>
          <div className="flex-1 min-h-0 overflow-hidden bg-[#F9F6F4] rounded-2xl p-4 border border-[#32574C]/10">
             <EventList mode="compact" />
          </div>
        </div>
      </div>
    </div>
  );
}