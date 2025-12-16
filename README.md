# Court Leaderboard

A real-time leaderboard application for tracking player rankings and match history, built for the Edge.

## Tech Stack

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
*   **Language:** TypeScript
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
*   **Animation:** [Framer Motion](https://www.framer.com/motion/)
*   **Backend:** Cloudflare Workers
*   **Database:** Cloudflare D1 (SQLite) + [Drizzle ORM](https://orm.drizzle.team/)
*   **Storage:** Cloudflare R2 (Avatars)
*   **Deployment:** Cloudflare Workers (via [OpenNext](https://opennext.js.org/))

## Features

*   **Live Leaderboard:** Real-time ranking updates with smooth animations.
*   **Admin Dashboard:** Mobile-friendly interface to manage players and record matches.
*   **Match Tracking:** Record match results for Padel, Tennis, and Badminton.
*   **Edge Performance:** Fully deployed on Cloudflare's global network for low latency.

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run development server:**
    ```bash
    npm run dev
    ```

3.  **Deploy to Cloudflare:**
    ```bash
    npm run deploy      # Frontend
    npm run deploy:api  # Backend API
    ```

## Project Structure

*   `src/` - Next.js frontend application.
*   `api/` - Cloudflare Worker API & Database schema.
*   `drizzle/` - Database migrations.

## Security

The `/admin` routes are designed to be protected by **Cloudflare Access** (Zero Trust), offloading authentication to the edge.
