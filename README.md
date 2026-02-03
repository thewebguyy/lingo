# Lingo v1.0 — The Universal Content Bridge

Lingo is an AI-powered content repurposing tool designed to synchronize your voice across TikTok, X (Twitter), and LinkedIn. It features advanced tone-mapping and support for regional dialects like Lagos Pidgin.

## Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Express (TypeScript), BullMQ, Redis.
- **Auth**: Clerk.
- **Storage**: Redis (Job Queue), SQLite (Result Persistence).
- **AI**: OpenAI GPT-4o.

## Project Structure

- `/` - Next.js Frontend
- `/backend` - Express API & Workers
- `/backend/src/db.ts` - SQLite setup
- `/backend/lingo.db` - Persistent data (SQLite)

## Getting Started

### 1. Prerequisites
- Node.js & npm
- Redis (Local or Upstash)

### 2. Environment Variables

#### Frontend (`/`)
Create a `.env.local` file:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

#### Backend (`/backend`)
Create a `.env` file:
```env
OPENAI_API_KEY=your_openai_key
REDIS_URL=redis://localhost:6379
PORT=4000
```

### 3. Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 4. Running the App

You can run both service concurrently from the root:
```bash
npm run dev:all
```

Or separately:

```bash
# Frontend
npm run dev

# Backend
npm run dev:backend
```

## Features for v1.0

- [x] **End-to-End Content Sync**: Input content, select platforms/dialects, and see reformatted drafts.
- [x] **Clerk Auth**: Secure user accounts and protected `/app` route.
- [x] **Tone Mapping**: Automatically adjust content for TikTok (slang), LinkedIn (professional), and X (witty).
- [x] **Lagos Pidgin Support**: Real, authenticPidgin English reformatting.
- [x] **Result Persistence**: SQLite backend to store generated drafts forever.
- [x] **Clean SaaS UI**: Premium sidebar-based dashboard.

## Roadmap

- [ ] Platform OAuth integrations (Direct posting)
- [ ] Video Auto-Captions
- [ ] Engagement Analytics
- [ ] Multi-agent Orchestration
