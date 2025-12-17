# court leaderboard

simple leaderboard app to track rankings and matches.

## tech stack

*   **framework:** [next.js 15](https://nextjs.org/) (app router)
*   **language:** typescript
*   **styling:** [tailwind css](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
*   **animation:** [framer motion](https://www.framer.com/motion/)
*   **backend:** cloudflare workers
*   **database:** cloudflare d1 (sqlite) + [drizzle orm](https://orm.drizzle.team/)
*   **storage:** cloudflare r2 (avatars)
*   **deployment:** cloudflare workers (via [opennext](https://opennext.js.org/))

## features

*   **live leaderboard:** real-time ranking updates with smooth animations.
*   **admin dashboard:** mobile-friendly interface to manage players and record matches.
*   **match tracking:** record match results for padel, tennis, and badminton.
*   **edge performance:** fully deployed on cloudflare's global network.

## getting started

1.  **install dependencies:**
    ```bash
    npm install
    ```

2.  **run development server:**
    ```bash
    npm run dev
    ```

3.  **deploy to cloudflare:**
    ```bash
    npm run deploy      # frontend
    npm run deploy:api  # backend api
    ```

## project structure

*   `src/` - next.js frontend application.
*   `api/` - cloudflare worker api & database schema.
*   `drizzle/` - database migrations.
