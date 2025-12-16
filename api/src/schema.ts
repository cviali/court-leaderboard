import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sports = ["padel", "tennis", "badminton"] as const;

export const courts = sqliteTable("courts", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: sports }).notNull(),
});

export const players = sqliteTable("players", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  instagramHandle: text("instagram_handle"),
  points: integer("points").default(0).notNull(),
  lastMatchAt: integer("last_match_at", { mode: "timestamp" }),
  lastCourtId: integer("last_court_id").references(() => courts.id),
});

export const matches = sqliteTable("matches", {
  id: integer("id").primaryKey(),
  winnerId: integer("winner_id")
    .notNull()
    .references(() => players.id),
  loserId: integer("loser_id")
    .notNull()
    .references(() => players.id),
  sport: text("sport", { enum: sports }).notNull(),
  courtId: integer("court_id")
    .references(() => courts.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
