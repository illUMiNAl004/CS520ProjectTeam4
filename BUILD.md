# Build & Setup Guide

## Prerequisites

- Node.js v18+
- npm v9+
- A PostgreSQL database (project uses [Supabase](https://supabase.com))

---

## Environment Variables

Create a `.env` file in the project root:

```
DATABASE_URL=your_supabase_postgres_connection_string
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
PORT=5001
```

> Get `DATABASE_URL` from Supabase → Project Settings → Database → Connection string (URI mode).

---

## Install Dependencies

```bash
npm install
```

---

## Run Locally

Start both the React frontend and Express backend together:

```bash
npm run dev
```

Or separately:

```bash
# Backend only (http://localhost:5001)
npm run server

# Frontend only (http://localhost:3000)
npm start
```

The frontend proxies API requests to `http://localhost:5001` automatically.

---

## Database

The database schema is initialized automatically on every server start via `server/db.js`. No manual migrations needed. Tables created:

- `rider` — rider accounts
- `driver` — driver accounts + vehicle info + preferences
- `matches` — active/cancelled/completed ride matches

> **Note:** `initDb()` drops legacy tables (`users`, `vehicles`, `driver_settings`) on startup if they exist.

---

## Production Build

```bash
npm run build
```

Outputs a static bundle to `/build`. Deploy to any static host (Netlify, Vercel, etc.) and point the backend to your hosted Supabase instance.

---

## Deploy to GitHub Pages

```bash
npm run deploy
```

Requires the `homepage` field in `package.json` to point to your GitHub Pages URL.

---

## Project Structure

```
/
├── server/
│   ├── index.js       # Express API (auth, matching, driver endpoints)
│   └── db.js          # PostgreSQL schema + pool
├── src/
│   ├── pages/         # React pages (Auth, BookRide, Matching, Payment, DriverProfile, DriverSetup, ...)
│   ├── components/    # Shared components (AddressInput, RouteMap)
│   └── schema/        # API helper functions (riderApi, driverApi)
├── .env               # Local environment variables (not committed)
└── package.json
```

---

## Key Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run frontend + backend concurrently |
| `npm start` | Frontend only |
| `npm run server` | Backend only (nodemon) |
| `npm run build` | Production build |
| `npm run deploy` | Deploy to GitHub Pages |