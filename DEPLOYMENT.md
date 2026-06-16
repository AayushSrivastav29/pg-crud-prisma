# Deployment Guide - PostgreSQL CRUD with Prisma

## Overview

This is a **full-stack application** with:

- **Frontend**: Vue 3 + TypeScript + Ant Design (static SPA)
- **Backend**: Express.js + Prisma ORM + PostgreSQL
- **Database**: PostgreSQL (Supabase or self-hosted)

Since **Netlify only supports static site deployment**, we need to separate the frontend and backend deployments.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Netlify (Frontend - Static)                                 │
│ ├─ dist/ (Vue 3 SPA)                                        │
│ └─ API calls to → Backend API                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Backend Server (Vercel, Railway, Render, or self-hosted)  │
│ ├─ Express.js API                                           │
│ ├─ Prisma ORM                                               │
│ └─ PostgreSQL connection                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ PostgreSQL Database (Supabase or self-hosted)               │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Deploy Frontend on Netlify

### Step 1: Setup Netlify Account

1. Go to [netlify.com](https://netlify.com) and create a free account
2. Connect your GitHub repository

### Step 2: Configure Netlify Build Settings

The project includes `netlify.toml` with the correct configuration:

```toml
[build]
command = "npm run build"
publish = "dist"
```

**No additional configuration needed!** The `netlify.toml` file is already set up.

### Step 3: Set Environment Variables

In **Netlify Dashboard** → Site Settings → Build & Deploy → Environment:

```
VITE_API_BASE_URL=https://your-backend-api.com/api
```

Replace `https://your-backend-api.com` with your actual backend URL.

### Step 4: Deploy

1. Push code to GitHub
2. Netlify automatically triggers build and deployment
3. Your site will be live at `https://your-site.netlify.app`

---

## Part 2: Deploy Backend

You have multiple options for backend deployment:

### Option A: Deploy on Vercel (Recommended)

1. Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

2. Add `@vercel/node` to devDependencies:

```bash
npm install --save-dev @vercel/node
```

3. Push to GitHub and connect to Vercel
4. Set `DATABASE_URL` environment variable in Vercel dashboard

### Option B: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Create new project → GitHub repo
3. Add PostgreSQL plugin (or connect existing database)
4. Set `DATABASE_URL` environment variable
5. Railway auto-detects `start` script and deploys

### Option C: Deploy on Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Set start command: `node dist/server.js`
5. Add PostgreSQL database or connect existing
6. Set `DATABASE_URL` environment variable

### Option D: Deploy on Fly.io

1. Install Fly CLI: `brew install flyctl`
2. Run: `flyctl launch`
3. Configure fly.toml
4. Deploy: `flyctl deploy`

---

## Environment Variables Setup

### Frontend (.env.production)

```
VITE_API_BASE_URL=https://your-backend-url.com/api
```

### Backend (.env)

```
DATABASE_URL=postgresql://user:password@host:port/dbname
PORT=3000
NODE_ENV=production
```

For **Supabase PostgreSQL**, get the connection string from:

- Supabase Dashboard → Settings → Database → Connection String

---

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL running (or Supabase account)

### Setup

1. **Install dependencies:**

```bash
npm install
npm run prisma:generate
```

2. **Configure database:**

```bash
cp .env.example .env
# Edit .env and set DATABASE_URL
```

3. **Run migrations:**

```bash
npm run prisma:migrate
```

4. **Seed database (optional):**

```bash
npm run seed
```

5. **Start development:**

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## Build for Production

### Frontend Only (for Netlify)

```bash
npm run build:frontend
# Output: dist/
```

### Full Stack (for self-hosted)

```bash
npm run build
# Frontend: dist/
# Backend: dist/server.js
```

---

## Important Notes

### CORS Setup

The backend has CORS enabled for development. For production, update:

```typescript
app.use(
  cors({
    origin: ["https://your-site.netlify.app"],
    credentials: true,
  }),
);
```

### Database Migrations

After deploying backend, run migrations:

```bash
npx prisma migrate deploy
```

Or use Prisma Accelerate for cloud-hosted databases.

### Prisma Client

The frontend doesn't need Prisma Client. All database operations go through the API.

---

## Troubleshooting

### Frontend Not Connecting to Backend

Check:

1. `VITE_API_BASE_URL` environment variable is set correctly
2. Backend is running and accessible
3. CORS is configured to allow frontend origin
4. Browser DevTools → Network tab shows API requests

### Database Connection Issues

Check:

1. `DATABASE_URL` is correct and accessible
2. Database server is running
3. Network allows outbound connections to database
4. Firewall/Security groups allow connections

### Build Failures on Netlify

1. Check Netlify build logs
2. Ensure Node version is set correctly (20+)
3. Clear cache: Netlify Dashboard → Deploys → Clear cache and retry
4. Run `npm install` locally and commit `package-lock.json`

---

## Summary

✅ **Frontend:** Deploy on Netlify  
✅ **Backend:** Deploy on Vercel, Railway, Render, or Fly.io  
✅ **Database:** Supabase PostgreSQL or self-hosted PostgreSQL  
✅ **Routing:** SPA configured with `netlify.toml` and `_redirects`  
✅ **CORS:** Configured for production

Your application is now **production-ready**! 🚀
