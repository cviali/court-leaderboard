import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";
import { players, matches, courts } from "./schema";
import { eq, sql, desc } from "drizzle-orm";
import { Router, IRequest } from "itty-router";
import type { D1Database } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
}

interface Player {
  id: number;
  name: string;
  points: number;
  lastMatchAt: Date | null;
  lastCourtId: number | null;
}

type CustomRequest = IRequest & {
  db: DrizzleD1Database<typeof schema>;
  corsHeaders: Record<string, string>;
};

// Create a new router
const router = Router();

// Middleware to attach the database and CORS headers
const withDB = (request: IRequest, env: Env) => {
  const req = request as CustomRequest;
  req.db = drizzle(env.DB, { schema });
  req.corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
};

// Handle CORS preflight requests
router.options("*", (request: IRequest) => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
});

router.get("/players", withDB, async (request: IRequest, env: Env) => {
  const req = request as CustomRequest;
  const db = req.db;
  const players: Player[] = await db.query.players.findMany({
    orderBy: (players: any) => [desc(players.points)],
  });
  return new Response(JSON.stringify(players), {
    headers: {
      ...req.corsHeaders,
      "Content-Type": "application/json",
    },
  });
});

router.post("/players", withDB, async (request: IRequest, env: Env) => {
  const req = request as CustomRequest;
  const db = req.db;
  const { name } = (await request.json()) as { name: string };
  if (!name) {
    return new Response("Name is required", {
      status: 400,
      headers: req.corsHeaders,
    });
  }
  const newPlayer = await db.insert(players).values({ name }).returning();
  return new Response(JSON.stringify(newPlayer), {
    headers: {
      ...req.corsHeaders,
      "Content-Type": "application/json",
    },
    status: 201,
  });
});

router.put("/players/:id", withDB, async (request: IRequest, env: Env) => {
  const req = request as CustomRequest;
  const db = req.db;
  const id = parseInt(request.params.id);
  const { name, points } = (await request.json()) as {
    name?: string;
    points?: number;
  };

  if (!name && points === undefined) {
    return new Response("Name or points are required", {
      status: 400,
      headers: req.corsHeaders,
    });
  }

  const updateData: { name?: string; points?: number } = {};
  if (name) updateData.name = name;
  if (points !== undefined) updateData.points = points;

  const updatedPlayer = await db
    .update(players)
    .set(updateData)
    .where(eq(players.id, id))
    .returning();

  return new Response(JSON.stringify(updatedPlayer), {
    headers: {
      ...req.corsHeaders,
      "Content-Type": "application/json",
    },
  });
});

router.get("/courts", withDB, async (request: IRequest, env: Env) => {
  const req = request as CustomRequest;
  const db = req.db;
  const allCourts = await db.select().from(courts);
  return new Response(JSON.stringify(allCourts), {
    headers: {
      ...req.corsHeaders,
      "Content-Type": "application/json",
    },
  });
});

router.get("/matches", withDB, async (request: IRequest, env: Env) => {
  const req = request as CustomRequest;
  const db = req.db;
  const allMatches = await db
    .select()
    .from(matches)
    .orderBy(desc(matches.createdAt));
  return new Response(JSON.stringify(allMatches), {
    headers: {
      ...req.corsHeaders,
      "Content-Type": "application/json",
    },
  });
});

router.post("/matches", withDB, async (request: IRequest, env: Env) => {
  const req = request as CustomRequest;
  const db = req.db;
  const { winnerId, loserId, sport, courtId } = (await request.json()) as {
    winnerId: number;
    loserId: number;
    sport: "padel" | "tennis" | "badminton";
    courtId: number;
  };

  if (!winnerId || !loserId || !sport || !courtId) {
    return new Response("Missing required fields", {
      status: 400,
      headers: req.corsHeaders,
    });
  }

  await db.insert(matches).values({
    winnerId,
    loserId,
    sport,
    courtId,
    createdAt: new Date(),
  });

  await db
    .update(players)
    .set({ points: sql`${players.points} + 10`, lastMatchAt: new Date(), lastCourtId: courtId })
    .where(eq(players.id, winnerId));

  await db
    .update(players)
    .set({ lastMatchAt: new Date(), lastCourtId: courtId })
    .where(eq(players.id, loserId));

  return new Response(JSON.stringify({ message: "Match recorded" }), {
    headers: {
      ...req.corsHeaders,
      "Content-Type": "application/json",
    },
    status: 201,
  });
});

// 404 for everything else
router.all("*", (request: IRequest) => {
  return new Response("Not Found", {
    status: 404,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
});

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return router.handle(request, env, ctx).catch(
      (err) =>
        new Response(err.stack, {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        })
    );
  },
};
