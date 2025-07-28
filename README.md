# AI Chat App

A dual-mode AI chat application with collective and personal experiences, featuring markdown rendering, conversation management, and seamless authentication.

## 🎯 Two Distinct Experiences

### 🎉 Fun Mode
- **Collective AI Experience**: Everyone shares the same conversation memory
- **No Sign-in Required**: Instant access for experimentation
- **Shared Knowledge**: AI learns from all user interactions
- **Perfect for**: Discovery, learning, and collaborative conversations

### 🔒 Personal Mode  
- **Private AI Assistant**: Personal conversation history and memory
- **Google Authentication**: Secure, private access
- **Chat Management**: Save, organize, and revisit conversations
- **Perfect for**: Personal projects, private assistance, and individual workflows

## ✨ Features

- 🤖 **AI Chat**: Powered by OpenAI GPT-4o with streaming responses
- 📝 **Markdown Support**: Rich text rendering with syntax highlighting
- 💬 **Conversation Management**: Save, title, and organize chat history (Personal Mode)
- 📱 **Mobile-Responsive**: Collapsible sidebar and touch-optimized interface
- ⌨️ **Enhanced Input**: Auto-expanding textarea with Shift+Enter for new lines
- 🧠 **Vector Memory**: Pinecone for intelligent context retrieval
- 🔐 **Dual Authentication**: Fun Mode (instant) + Google OAuth (personal)
- 🎨 **Clean UI**: Minimalist design with grey color scheme

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **Backend**: Next.js API Routes, NextAuth.js v4
- **Database**: PostgreSQL with Prisma ORM
- **Vector DB**: Pinecone for semantic search
- **AI**: OpenAI GPT-4o + text-embedding-3-small
- **Markdown**: react-markdown with syntax highlighting
- **Authentication**: NextAuth.js with Google Provider + Custom Fun Mode

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd chat-app
pnpm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://chat_user:chat_password@localhost:5432/chat_app_db"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (for Personal Mode)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Services
OPENAI_API_KEY="your-openai-api-key"
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX="your-pinecone-index-name"
```

### 3. Start Database

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Run database migrations
pnpm db:migrate
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page (Fun Mode + Auth selection)
│   ├── app/page.tsx       # Personal Mode chat interface
│   └── api/               # API routes
├── components/            # React components
│   ├── chat-interface.tsx         # Fun Mode chat
│   ├── personal-chat-interface.tsx # Personal Mode chat
│   ├── chat-sidebar.tsx           # Conversation sidebar
│   ├── markdown-message.tsx       # Message rendering
│   └── ui/                        # Base UI components
├── hooks/                 # Custom React hooks
│   └── useConversations.ts        # Conversation management
├── lib/                   # Utilities and configurations
│   ├── auth.ts            # NextAuth configuration
│   ├── openai.ts          # OpenAI client
│   ├── pinecone.ts        # Pinecone client
│   └── conversation-title-generator.ts # AI title generation
└── prisma/               # Database schema and migrations
```

## 🎮 Usage

### Fun Mode
1. Visit homepage
2. Click "Fun Mode" button
3. Start chatting immediately
4. Access shared AI memory and conversations

### Personal Mode
1. Visit homepage  
2. Click "Sign in with Google"
3. Create and manage private conversations
4. Use sidebar to navigate chat history
5. Enjoy personalized AI assistance

### Chat Features
- **Markdown Rendering**: AI responses support full markdown
- **Expandable Input**: Textarea grows with content
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line
- **Mobile Support**: Collapsible sidebar with overlay

## 🗃 Database Management

### Prisma Commands

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# View database in browser
pnpm db:studio

# Reset database
pnpm db:reset
```

### pgAdmin (Optional)

Access pgAdmin at [http://localhost:8080](http://localhost:8080)
- **Email**: `admin@chatapp.com`
- **Password**: `admin123`

## 🔧 Development

### Key Features Implementation

- **Dual Mode Architecture**: Separate authentication flows and data isolation
- **AI Title Generation**: Automatic conversation naming based on content
- **Markdown Rendering**: Syntax highlighting and rich text display
- **Responsive Design**: Mobile-first with collapsible navigation
- **Vector Search**: Semantic conversation history retrieval

### Database Schema

The app uses Prisma with PostgreSQL:
- **Users**: Authentication and profile data
- **Conversations**: Chat sessions (Personal Mode only)  
- **Messages**: Individual chat messages

### Adding Features

1. **New UI Components**: Add to `src/components/ui/`
2. **API Endpoints**: Create in `src/app/api/`
3. **Database Changes**: Update `prisma/schema.prisma` and migrate
4. **Authentication**: Modify `src/lib/auth.ts`

## 🚀 Production Deployment

### Environment Checklist
- [ ] Configure production database URL
- [ ] Set secure `NEXTAUTH_SECRET`
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Configure Google OAuth for production domain
- [ ] Set up Pinecone production index
- [ ] Verify OpenAI API key limits

### Recommended Stack
- **Hosting**: Vercel, Netlify, or similar
- **Database**: Railway, Supabase, or managed PostgreSQL
- **Vector DB**: Pinecone (production tier)

## 🐛 Troubleshooting

### Common Issues

**Database Connection**
```bash
# Check PostgreSQL status
docker-compose ps
docker-compose logs postgres
```

**Build Errors**
```bash
# Clear Next.js cache
pnpm clean
pnpm build
```

**Authentication Issues**
- Verify Google OAuth credentials
- Check `NEXTAUTH_URL` matches your domain
- Ensure `NEXTAUTH_SECRET` is set

**Vector Search Not Working**
- Verify Pinecone API key and index name
- Check Pinecone index dimensions (1536 for text-embedding-3-small)

## 📄 License

MIT License - see LICENSE file for details.