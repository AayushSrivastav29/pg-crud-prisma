# PostgreSQL CRUD with Prisma + TypeScript + Node.js

A clean demo project testing all CRUD operations against a Supabase PostgreSQL database using Prisma ORM and TypeScript.

## Tech Stack

| Tool | Role |
|------|------|
| **TypeScript** | Language |
| **Node.js** | Runtime |
| **Prisma** | ORM & migrations |
| **PostgreSQL** | Database (Supabase) |

## Project Structure

```
pg-crud-prisma/
├── prisma/
│   └── schema.prisma       # DB models (User, Post)
├── src/
│   ├── lib/
│   │   └── prisma.ts       # Prisma client singleton
│   ├── crud/
│   │   ├── userCrud.ts     # User CRUD operations
│   │   └── postCrud.ts     # Post CRUD operations
│   ├── index.ts            # Main demo runner
│   └── seed.ts             # Database seeder
├── .env.example            # Environment variable template
├── tsconfig.json
└── package.json
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and set your DATABASE_URL
```

### 3. Generate Prisma client

```bash
npm run prisma:generate
```

### 4. Push schema to database (no migration files)

```bash
npx prisma db push
```

Or run migrations:

```bash
npm run prisma:migrate
```

### 5. Run the CRUD demo

```bash
npm run dev
```

### 6. (Optional) Seed the database

```bash
npm run seed
```

### 7. (Optional) Open Prisma Studio

```bash
npm run prisma:studio
```

## Models

### User
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Auto-increment PK |
| email | String | Unique |
| name | String | |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Post
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Auto-increment PK |
| title | String | |
| content | String? | Optional |
| published | Boolean | Default false |
| authorId | Int | FK → User |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

## Available Scripts

```bash
npm run dev            # Run the CRUD demo (ts-node)
npm run build          # Compile TypeScript
npm run start          # Run compiled JS
npm run seed           # Seed the database
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:migrate   # Run DB migrations
npm run prisma:studio    # Open Prisma Studio GUI
```
