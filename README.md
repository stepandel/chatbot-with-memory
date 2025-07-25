# AI Chat App

A full-stack chat application with AI responses, vector memory, and user authentication.

## Features

- 🤖 **AI Chat**: Powered by OpenAI GPT-4o
- 🧠 **Vector Memory**: Pinecone for conversation context retrieval
- 🔐 **Authentication**: NextAuth.js with PostgreSQL
- 💬 **Real-time Streaming**: Streaming AI responses
- 👤 **Multi-user**: Isolated conversations per user

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL (Docker)
- **Vector DB**: Pinecone
- **AI**: OpenAI GPT-4o + text-embedding-3-small

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd chat-app
pnpm install
```

### 2. Start Database

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres

# The database schema will be automatically applied on first run
```

### 3. Environment Setup

Copy `.env.local` and update the required API keys:

- `OPENAI_API_KEY` - Your OpenAI API key
- `PINECONE_API_KEY` - Your Pinecone API key
- `PINECONE_INDEX` - Your Pinecone index name
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

### 4. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Authentication

### Demo Credentials

- **Email**: `demo@example.com`
- **Password**: `demo`

### Google OAuth

Configure your Google OAuth credentials in `.env.local`

## Database Management

### pgAdmin (Optional)

Access pgAdmin at [http://localhost:8080](http://localhost:8080)

- **Email**: `admin@chatapp.com`
- **Password**: `admin123`

### Direct PostgreSQL Access

```bash
# Connect to database
docker exec -it chat-app-postgres psql -U chat_user -d chat_app_db

# View tables
\dt

# Stop database
docker-compose down
```

## Import ChatGPT Conversations

You can import your existing ChatGPT conversation history:

```bash
# Export conversations from ChatGPT Settings > Data Controls > Export
# Place the conversations.json file in the project root
pnpm exec tsx scripts/import-conversations.ts ./conversations.json
```

## Development

### Key Files

- `src/app/page.tsx` - Main chat interface
- `src/app/api/chat/route.ts` - Chat API with AI + vector search
- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/openai.ts` - OpenAI client wrapper
- `src/lib/pinecone.ts` - Pinecone client wrapper

### Database Schema

The PostgreSQL schema is automatically applied when you start the database. See `sql/schema.sql` for the complete schema.

### Adding New Auth Providers

Edit `src/lib/auth.ts` to add additional OAuth providers.

## Production Deployment

1. **Database**: Use a managed PostgreSQL service
2. **Environment**: Update all environment variables
3. **Security**: Generate a secure `NEXTAUTH_SECRET`
4. **Domain**: Update `NEXTAUTH_URL` to your production domain

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Clear Database

```bash
# Remove all data and restart fresh
docker-compose down -v
docker-compose up -d postgres
```
