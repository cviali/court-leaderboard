import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";
import { players, matches, courts } from "./schema";
import { eq, sql, desc } from "drizzle-orm";
import { Router, IRequest } from "itty-router";
import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
}

interface Player {
  id: number;
  name: string;
  avatarUrl: string | null;
  instagramHandle: string | null;
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
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "1000"); // Default high limit for backward compatibility
  const offset = (page - 1) * limit;

  const playersList = await db.query.players.findMany({
    orderBy: (players: any) => [desc(players.points)],
    limit: limit,
    offset: offset,
  });

  // If pagination params are present, return metadata (optional, but good practice)
  // For now, to maintain compatibility with existing frontend which expects an array,
  // we will just return the array. The frontend will need to be updated to handle
  // the "infinite scroll" logic by appending data.
  
  return new Response(JSON.stringify(playersList), {
    headers: {
      ...req.corsHeaders,
      "Content-Type": "application/json",
    },
  });
});

router.post("/players", withDB, async (request: IRequest, env: Env) => {
  const req = request as CustomRequest;
  const db = req.db;
  const { name, avatarUrl, instagramHandle } = (await request.json()) as { name: string; avatarUrl?: string; instagramHandle?: string };
  if (!name) {
    return new Response("Name is required", {
      status: 400,
      headers: req.corsHeaders,
    });
  }

  let finalAvatarUrl = avatarUrl;

  // If avatarUrl is a base64 string, upload it to R2
  if (avatarUrl && avatarUrl.startsWith("data:image")) {
    const base64Data = avatarUrl.split(",")[1];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const fileName = `avatars/${crypto.randomUUID()}.jpg`;
    
    await env.ASSETS.put(fileName, binaryData, {
      httpMetadata: { contentType: "image/jpeg" },
    });

    // Construct the public URL (assuming you have a custom domain or use the worker as a proxy)
    // For now, we'll store the R2 key and serve it via a new endpoint
    finalAvatarUrl = `/api/assets/${fileName}`;
  }

  const newPlayer = await db.insert(players).values({ name, avatarUrl: finalAvatarUrl, instagramHandle }).returning();
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
  const { name, points, avatarUrl, instagramHandle } = (await request.json()) as {
    name?: string;
    points?: number;
    avatarUrl?: string;
    instagramHandle?: string;
  };

  if (!name && points === undefined && !avatarUrl && instagramHandle === undefined) {
    return new Response("Name, points, avatarUrl, or instagramHandle are required", {
      status: 400,
      headers: req.corsHeaders,
    });
  }

  const updateData: { name?: string; points?: number; avatarUrl?: string | null; instagramHandle?: string | null } = {};
  if (name) updateData.name = name;
  if (points !== undefined) updateData.points = points;
  if (instagramHandle !== undefined) updateData.instagramHandle = instagramHandle;
  
  if (avatarUrl !== undefined) {
    if (avatarUrl && avatarUrl.startsWith("data:image")) {
      const base64Data = avatarUrl.split(",")[1];
      const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const fileName = `avatars/${crypto.randomUUID()}.jpg`;
      
      await env.ASSETS.put(fileName, binaryData, {
        httpMetadata: { contentType: "image/jpeg" },
      });

      updateData.avatarUrl = `/api/assets/${fileName}`;
    } else if (avatarUrl === "" || avatarUrl === null) {
      updateData.avatarUrl = null;
    } else {
      updateData.avatarUrl = avatarUrl;
    }
  }

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
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "1000");
  const offset = (page - 1) * limit;

  const allMatches = await db
    .select()
    .from(matches)
    .orderBy(desc(matches.createdAt))
    .limit(limit)
    .offset(offset);

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

// Serve assets from R2
router.get("/assets/*", async (request: IRequest, env: Env) => {
  const url = new URL(request.url);
  const key = url.pathname.replace("/assets/", "");
  
  const object = await env.ASSETS.get(key);

  if (!object) {
    return new Response("Object Not Found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(object.body, {
    headers,
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
