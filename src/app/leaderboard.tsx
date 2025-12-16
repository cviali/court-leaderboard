"use client";

import { Player, Court } from "@/lib/types";
import { useEffect, useState } from "react";
import { Trophy, Medal, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());

  useEffect(() => {
    setPlayers(initialPlayers);
    setCourts(initialCourts);
    setLastUpdated(new Date());
  }, [initialPlayers, initialCourts]);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000); // Refresh every 5 seconds (hits server cache)

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/logo.png"
          alt="Court Leaderboard Logo"
          width={160}
          height={160}
          className="mb-6"
          style={{ width: "160px", height: "auto" }}
          priority
        />
        {lastUpdated && (
          <span className="text-sm text-muted-foreground font-medium">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
      {/* List */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
        {players.map((player, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;
          
          return (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              key={player.id}
              className={cn(
                "relative flex items-center justify-between p-6 rounded-2xl border-2 transition-colors duration-200 hover:shadow-lg",
                "bg-[#F9F6F4]",
                rank === 1 ? "border-yellow-400/50 bg-gradient-to-r from-yellow-50/30 to-transparent" :
                rank === 2 ? "border-gray-300/50 bg-gradient-to-r from-gray-50/30 to-transparent" :
                rank === 3 ? "border-amber-600/30 bg-gradient-to-r from-amber-50/30 to-transparent" :
                "border-transparent hover:border-[#32574C]/20 shadow-sm"
              )}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-16 shrink-0">
                {rank === 1 ? (
                  <Trophy className="w-10 h-10 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
                ) : rank === 2 ? (
                  <Medal className="w-9 h-9 text-gray-400 fill-gray-400 drop-shadow-sm" />
                ) : rank === 3 ? (
                  <Medal className="w-9 h-9 text-amber-600 fill-amber-600 drop-shadow-sm" />
                ) : (
                  <span className="text-3xl font-black text-[#32574C]/30 font-mono">
                    {String(rank).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Player Info */}
              <div className="flex-1 px-8 min-w-0 flex items-center gap-6">
                <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                  <AvatarImage src={player.avatarUrl || undefined} alt={player.name} className="object-cover" />
                  <AvatarFallback className="text-xl font-bold bg-[#32574C]/10 text-[#32574C]">
                    {player.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn(
                      "text-2xl font-bold truncate tracking-tight",
                      isTop3 ? "text-[#32574C]" : "text-[#82644f]"
                    )}>
                      {player.name}
                    </span>
                    {player.instagramHandle && (
                      <>
                        <div className="h-6 w-[2px] bg-[#82644f]/20 rounded-full" />
                        <span 
                          className="text-lg font-semibold text-[#32574C] truncate shrink-0"
                        >
                          {player.instagramHandle}
                        </span>
                      </>
                    )}
                  </div>
                  {player.lastMatchAt && (
                    <div className="flex items-center gap-4 text-sm font-medium text-[#82644f]/80">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#32574C]/70" />
                        <span>
                          {new Date(player.lastMatchAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      {player.lastCourtId && courts.find((c) => c.id === player.lastCourtId) && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#32574C]/70" />
                          <span>{courts.find((c) => c.id === player.lastCourtId)?.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Points */}
              <div className="flex items-center justify-end w-32">
                <div className="flex flex-col items-end leading-none">
                  <span className={cn(
                    "text-4xl font-black tracking-tighter",
                    "text-[#32574C]"
                  )}>
                    <AnimatedNumber value={player.points} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#82644f]/60 mt-1">
                    Points
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
    </div>
  );
}
