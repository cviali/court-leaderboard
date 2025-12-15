"use server";

import { revalidateTag } from "next/cache";

export async function revalidateLeaderboard() {
  revalidateTag("leaderboard");
}
