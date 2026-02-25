import { Leaderboard } from "./leaderboard";
import { PageTransition } from "@/components/page-transition";
import { Player, Court } from "@/lib/types";
import { API_URL } from "@/lib/constants";

async function getLeaderboardData() {
  const res = await fetch(`${API_URL}/leaderboard`, {
    next: { tags: ["leaderboard"] },
  });

  const data = (await res.json()) as { players: Player[]; courts: Court[] };

  return { players: data.players, courts: data.courts };
}

export default async function Home() {
  const { players, courts } = await getLeaderboardData();

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#EFE9E4]">
        <main className="w-full">
          <Leaderboard initialPlayers={players} initialCourts={courts} />
        </main>
      </div>
    </PageTransition>
  );
}
