# YouTube Transcript Generator Studio

Complete runbook for the YouTube Transcript Generator application with React/Next.js frontend and API backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (recommended) or SQLite for development
- OpenAI API key

### Installation & Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd youtube-transcript-generator
npm install
```

2. **Environment Configuration:**
```bash
cp .env.local .env.local.example
# Edit .env.local with your configuration
```

Required environment variables:
```env
# Database (Production - PostgreSQL with Supabase)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"  
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key-here"

# Database (Development - SQLite)  
# DATABASE_URL="file:./dev.db"

# AI Provider (choose one)
OPENAI_API_KEY="your-openai-api-key-here"
ANTHROPIC_API_KEY="your-anthropic-api-key-here"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

3. **Database Setup:**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

4. **Start Development Server:**
```bash
npm run dev
```

Access the application at: `http://localhost:3000/studio`

---

## 📁 Project Structure

```
youtube-transcript-generator/
├── prisma/
│   └── schema.prisma              # Database schema
├── src/
│   ├── app/
│   │   ├── api/                   # API routes
│   │   │   ├── script/generate/   # Script generation endpoint
│   │   │   ├── transcript/fetch/  # Transcript fetch endpoint  
│   │   │   └── video/[id]/        # Video operations endpoint
│   │   ├── studio/
│   │   │   └── page.tsx           # Main Studio UI page
│   │   └── globals.css            # Global styles with design system
│   ├── components/
│   │   ├── studio/                # Studio-specific components
│   │   │   ├── ScriptForm.tsx     # Script generation form
│   │   │   ├── ScriptOutputTabs.tsx # Script results display  
│   │   │   ├── TranscriptCard.tsx # Transcript display card
│   │   │   └── UrlIngestCard.tsx  # URL input component
│   │   └── ui/                    # shadcn/ui components
│   └── lib/
│       ├── ai/
│       │   └── script-generator.ts # AI script generation logic
│       ├── youtube/
│       │   ├── extract-id.ts      # YouTube URL parsing
│       │   └── fetch-transcript.ts # Transcript fetching
│       ├── prisma.ts              # Database client (singleton)
│       ├── types.ts               # TypeScript type definitions
│       └── utils.ts               # Utility functions
├── docs/
│   └── contracts.md               # API documentation
├── changes/
│   └── pending.md                 # Change coordination file
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind CSS configuration
└── .env.local                     # Environment variables
```

---

## 🎨 Studio UI Components

### Main Interface (`/studio`)
- **UrlIngestCard**: YouTube URL input and video loading
- **TranscriptCard**: Display fetched transcript with segments
- **ScriptForm**: Configure script generation (style, duration, audience)
- **ScriptOutputTabs**: View generated scripts with multiple tabs

### Design System
- **Framework**: shadcn/ui with Tailwind CSS
- **Components**: Button, Card, Input, Select, Tabs, Collapsible
- **Theme**: Light/dark mode support with CSS custom properties
- **Icons**: Lucide React icons

---

## 🔌 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Core Endpoints

#### 1. Fetch Transcript
```http
POST /api/transcript/fetch
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "userId": "user_id_string", 
  "language": "en"
}
```

#### 2. Generate Script  
```http
POST /api/script/generate
Content-Type: application/json

{
  "videoId": "internal_video_id",
  "style": "PROFESSIONAL",
  "durationMin": 5,
  "audience": "general",
  "options": {
    "tone": "formal",
    "includeIntro": true,
    "includeConclusion": true,
    "keyPoints": ["Point 1", "Point 2"]
  }
}
```

#### 3. Get Video Data
```http
GET /api/video/[id]
```

**Full API documentation**: See `/docs/contracts.md`

---

## 🏗️ Development Workflow

### Track Ownership Map

#### Track 1: Database & API (Backend)
**Owner**: Backend Team
**Files**:
- `prisma/schema.prisma` - Database schema
- `src/app/api/**` - All API routes  
- `src/lib/ai/script-generator.ts` - AI integration
- `src/lib/youtube/**` - YouTube integration
- `src/lib/prisma.ts` - Database client
- `src/lib/types.ts` - Type definitions

#### Track 2: Studio UI (Frontend) 
**Owner**: Frontend Team
**Files**:
- `src/app/studio/**` - Studio pages
- `src/components/studio/**` - Studio components
- `src/components/ui/**` - shadcn/ui components  
- `src/lib/utils.ts` - UI utilities

#### Track 3: Architecture & Wiring (System)
**Owner**: System Architect  
**Files**:
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind configuration
- `src/app/globals.css` - Global styles
- `.env.local` - Environment configuration
- `README_STUDIO.md` - Documentation

### Development Commands

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production  
npm run start              # Start production server
npm run lint               # Run ESLint

# Database Operations
npm run postinstall        # Auto-run after npm install
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema changes (dev)
npm run db:migrate        # Run migrations (prod)
npm run db:seed           # Run database seeding

# Code Quality
npx prisma studio         # Open Prisma Studio
npx prisma format         # Format schema file
npm run type-check        # TypeScript type checking
```

### Testing Workflow

1. **Unit Tests**: Component testing with Jest/React Testing Library
2. **Integration Tests**: API endpoint testing
3. **E2E Tests**: Full user workflow testing
4. **Manual Testing**: Studio UI functionality

---

## 🔧 Configuration Details

### TypeScript Configuration
- **Base URL**: `@/*` paths mapped to `./src/*`
- **Target**: ES6 with Next.js optimizations
- **Strict Mode**: Enabled for type safety

### Database Configuration  
- **Development**: SQLite with `file:./dev.db`
- **Production**: PostgreSQL with Supabase
- **ORM**: Prisma with client generation
- **Migrations**: Available for production deployments

### Styling Configuration
- **Framework**: Tailwind CSS v3.3+
- **Components**: shadcn/ui component library
- **Theme System**: CSS custom properties for light/dark themes
- **Animations**: Tailwind CSS animations with Radix UI

---

## 🚦 Quality Assurance

### Code Quality Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Code formatting (recommended)
- **Type Safety**: All API responses properly typed

### Performance Standards
- **Bundle Size**: <500KB initial, <2MB total
- **Load Time**: <3s on 3G networks
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **Database**: Connection pooling and query optimization

### Security Standards
- **Environment Variables**: No secrets in client code
- **API Security**: Input validation with Zod
- **Database**: Parameterized queries via Prisma
- **CORS**: Configured for production domains

---

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Build process completed successfully  
- [ ] Static assets optimized
- [ ] API endpoints tested
- [ ] Performance benchmarks met

### Environment Setup
```bash
# Production build
npm run build
npm run start

# Database setup  
npm run db:migrate
npm run db:generate
```

### Monitoring
- Database connection health
- API response times
- Error rates and logging
- User engagement metrics

---

## 📊 System Integration Status

### ✅ Completed
- Package.json with all dependencies
- TypeScript configuration  
- Environment template
- Tailwind CSS setup
- Global CSS with design system
- Database client singleton pattern
- API contracts documentation

### 🔄 In Progress  
- System integration testing
- Dependency installation verification
- Import resolution validation

### ⚠️ Requires Attention
- Environment variable configuration by user
- Database connection setup
- AI API key configuration  
- Production deployment configuration

---

## 🆘 Troubleshooting

### Common Issues

**Database Connection Issues**:
```bash
# Check database URL
echo $DATABASE_URL

# Regenerate Prisma client  
npm run db:generate

# Reset database (development only)
npx prisma db push --force-reset
```

**TypeScript Errors**:
```bash
# Check configuration
npx tsc --noEmit

# Clear Next.js cache
rm -rf .next
npm run dev
```

**Styling Issues**:
```bash
# Verify Tailwind CSS processing
npx tailwindcss -i src/app/globals.css -o dist/output.css

# Check PostCSS configuration
cat postcss.config.js
```

### Support Resources
- **API Documentation**: `/docs/contracts.md`
- **Database Schema**: `prisma/schema.prisma` 
- **Component Examples**: `src/components/studio/`
- **Type Definitions**: `src/lib/types.ts`

---

**Next Steps for QA**: Run system integration tests, verify all imports resolve, and validate end-to-end workflow from URL input to script generation.