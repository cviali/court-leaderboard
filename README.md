# Court Leaderboard

A real-time leaderboard application built with Next.js 15 and deployed on Cloudflare Workers using OpenNext. This application tracks player rankings, match history, and court usage statistics.

## Overview

The Court Leaderboard allows users to:
- View live player rankings based on match performance.
- Track match history and court utilization.
- Administer players and matches via a secured admin interface.

The application is optimized for performance using Server-Side Rendering (SSR) and Incremental Static Regeneration (ISR) to minimize database load while keeping data fresh.

## Architecture & Cloudflare Integration

This project leverages the Cloudflare ecosystem for high performance and scalability:

- **Cloudflare Workers**: The entire Next.js application runs on the Edge using [OpenNext](https://opennext.js.org/), providing low-latency SSR.
- **Cloudflare D1**: A serverless SQLite database stores all application data (players, courts, matches).
- **Cloudflare Images**: Used for optimizing and serving image assets.
- **Cloudflare Assets**: Efficiently serves static assets (CSS, JS, public files).

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Cloudflare Workers (via OpenNext)
- **Database**: Drizzle ORM with Cloudflare D1
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Project Structure

The project is organized into two main parts: the Next.js frontend and the Cloudflare Worker API.

- **`src/`**: Contains the Next.js frontend application.
  - **`app/`**: App Router pages, layouts, and global styles.
  - **`components/`**: Reusable UI components (including shadcn/ui).
  - **`lib/`**: Utility functions, types, and shared logic.
  - **`server/`**: Server-side logic and database interactions for the frontend.
- **`api/`**: Contains the standalone Cloudflare Worker API code.
  - Handles direct database operations and exposes endpoints used by the frontend.
- **`drizzle/`**: Database schema migrations.
- **`public/`**: Static assets like images and fonts.

## Getting Started

### Prerequisites

- Node.js
- Cloudflare Wrangler CLI

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

This command builds the Next.js application using OpenNext and deploys it to your Cloudflare account.

## Database Management

The project uses Drizzle ORM to manage the D1 database.

- **Generate Migrations**: `npm run db:generate`
- **Apply Migrations**: `npm run db:migrate`
- **Open Studio**: `npm run db:studio`
