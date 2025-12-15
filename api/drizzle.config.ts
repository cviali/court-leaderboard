import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    wranglerConfigPath: "wrangler.jsonc",
    dbName: "court-leaderboard",
  },
});
