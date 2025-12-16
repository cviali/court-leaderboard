import { Leaderboard } from "./leaderboard";
import { PageTransition } from "@/components/page-transition";
import { Player, Court } from "@/lib/types";

async function getLeaderboardData() {
  const [playersRes, courtsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://court-leaderboard-api.christian-d59.workers.dev"}/players`, {
      next: { tags: ["leaderboard"] },
    }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://court-leaderboard-api.christian-d59.workers.dev"}/courts`, {
      next: { tags: ["leaderboard"] },
    }),
  ]);

  const players = (await playersRes.json()) as Player[];
  const courts = (await courtsRes.json()) as Court[];

  return { players, courts };
}

export default async function Home() {
  const { players, courts } = await getLeaderboardData();

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#EFE9E4]">
        <main className="container mx-auto p-4">
          <Leaderboard initialPlayers={players} initialCourts={courts} />
        </main>
      </div>
    </PageTransition>
  );
}
